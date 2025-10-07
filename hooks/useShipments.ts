'use client';

import { useState, useEffect, useCallback } from 'react';
import { listShipmentsSchema, createShipmentSchema, updateShipmentSchema, markDeliveredSchema } from '@/lib/validators';
import { ZodError } from 'zod';

/**
 * Helper to normalize date to ISO string format
 */
const normalizeDate = (date: any): string | null | undefined => {
  if (!date) return undefined;
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') {
    // If it's a date-only string (YYYY-MM-DD), keep it as is - validator will handle it
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // Try to parse and convert to ISO
    try {
      return new Date(date).toISOString();
    } catch {
      return date; // Let validator handle invalid dates
    }
  }
  return undefined;
};

interface Shipment {
  id: string;
  trackingNumber: string;
  customerId: string;
  origin: string;
  destination: string;
  type: 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL';
  mode: 'AIR' | 'WATER' | 'LAND';
  weight: number;
  cost: number;
  isDelivered: boolean;
  deliveryDate?: string | null;
  estimatedDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
}

interface ShipmentFilters {
  type?: 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL';
  mode?: 'AIR' | 'WATER' | 'LAND';
  isDelivered?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface ShipmentStats {
  totalShipments: number;
  pendingShipments: number;
  deliveredShipments: number;
  totalRevenue: number;
  averageCost: number;
  byType: Record<string, number>;
  byMode: Record<string, number>;
  recentShipments?: any[];
}

interface UseShipmentsReturn {
  shipments: Shipment[];
  stats: ShipmentStats | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  fetchShipments: (filters?: ShipmentFilters) => Promise<void>;
  fetchStats: () => Promise<void>;
  createShipment: (data: Omit<Shipment, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateShipment: (id: string, data: Partial<Shipment>) => Promise<boolean>;
  deleteShipment: (id: string) => Promise<boolean>;
  markDelivered: (id: string, deliveryDate?: string) => Promise<boolean>;
}

export const useShipments = (initialFilters?: ShipmentFilters): UseShipmentsReturn => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState<ShipmentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 1);

  // Fetch shipments with filters
  const fetchShipments = useCallback(async (filters?: ShipmentFilters) => {
    // Client-side validation of filters
    try {
      if (filters) {
        const parsed = {
          ...filters,
          page: filters.page ? String(filters.page) : undefined,
          limit: filters.limit ? String(filters.limit) : undefined,
        };
        listShipmentsSchema.parse(parsed as any);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors.map(e => e.message).join(', '));
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.mode) params.append('mode', filters.mode);
      if (filters?.isDelivered !== undefined) params.append('isDelivered', String(filters.isDelivered));
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));

      const response = await fetch(`/api/shipments?${params.toString()}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        // Handle paginated response format: { success, data: { items, meta } }
        const items = data.data?.items || data.data || [];
        const meta = data.data?.meta || data.meta || {};
        
        setShipments(Array.isArray(items) ? items : []);
        setTotalPages(meta.totalPages || 1);
        setCurrentPage(meta.page || filters?.page || 1);
      } else {
        setError(data.message || 'Failed to fetch shipments');
      }
    } catch (err) {
      setError('Network error while fetching shipments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/shipments/stats', {
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  // Create shipment
  const createShipment = async (shipmentData: Omit<Shipment, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    // Client-side validation
    try {
      // normalize keys and values before validation: ensure enums are UPPERCASE, costs are strings
      const normalizedForValidation: any = {
        ...shipmentData,
        startLocation: (shipmentData as any).origin ?? (shipmentData as any).startLocation,
        endLocation: (shipmentData as any).destination ?? (shipmentData as any).endLocation,
        type: ((shipmentData as any).type || '').toString().toUpperCase(),
        mode: ((shipmentData as any).mode || '').toString().toUpperCase(),
        cost: typeof (shipmentData as any).cost === 'number' ? (shipmentData as any).cost.toFixed(2) : (shipmentData as any).cost,
        calculatedTotal: typeof (shipmentData as any).calculatedTotal === 'number' ? (shipmentData as any).calculatedTotal.toFixed(2) : (shipmentData as any).calculatedTotal ?? (typeof (shipmentData as any).cost === 'number' ? (shipmentData as any).cost.toFixed(2) : (shipmentData as any).cost),
        estimatedDeliveryDate: normalizeDate((shipmentData as any).estimatedDeliveryDate || (shipmentData as any).deliveryDate),
      };
      delete normalizedForValidation.origin;
      delete normalizedForValidation.destination;

      createShipmentSchema.parse(normalizedForValidation);
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors.map(e => e.message).join(', '));
        return false;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      // Normalize values to the server-expected shape/types:
      const payload: any = {
        ...shipmentData,
        startLocation: (shipmentData as any).origin ?? (shipmentData as any).startLocation,
        endLocation: (shipmentData as any).destination ?? (shipmentData as any).endLocation,
        // server expects enums in UPPERCASE
        type: ((shipmentData as any).type || '').toString().toUpperCase(),
        mode: ((shipmentData as any).mode || '').toString().toUpperCase(),
        // server validates cost as string decimal
        cost: typeof (shipmentData as any).cost === 'number' ? (shipmentData as any).cost.toFixed(2) : (shipmentData as any).cost,
        calculatedTotal: typeof (shipmentData as any).calculatedTotal === 'number' ? (shipmentData as any).calculatedTotal.toFixed(2) : (shipmentData as any).calculatedTotal,
        estimatedDeliveryDate: normalizeDate((shipmentData as any).estimatedDeliveryDate || (shipmentData as any).deliveryDate),
      };
      delete payload.origin;
      delete payload.destination;

      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        await fetchShipments(initialFilters);
        return true;
      } else {
        setError(data.message || 'Failed to create shipment');
        return false;
      }
    } catch (err) {
      setError('Network error while creating shipment');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update shipment
  const updateShipment = async (id: string, updates: Partial<Shipment>): Promise<boolean> => {
    // Client-side validation
    try {
      const normalizedForValidation: any = {
        ...updates,
        startLocation: (updates as any).origin ?? (updates as any).startLocation,
        endLocation: (updates as any).destination ?? (updates as any).endLocation,
        type: updates?.type ? (updates.type as any).toString().toUpperCase() : undefined,
        mode: updates?.mode ? (updates.mode as any).toString().toUpperCase() : undefined,
        cost: typeof (updates as any).cost === 'number' ? (updates as any).cost.toFixed(2) : (updates as any).cost,
        calculatedTotal: typeof (updates as any).calculatedTotal === 'number' ? (updates as any).calculatedTotal.toFixed(2) : (updates as any).calculatedTotal ?? (typeof (updates as any).cost === 'number' ? (updates as any).cost.toFixed(2) : (updates as any).cost),
        estimatedDeliveryDate: normalizeDate((updates as any).estimatedDeliveryDate || (updates as any).deliveryDate),
      };
      delete normalizedForValidation.origin;
      delete normalizedForValidation.destination;

      updateShipmentSchema.parse(normalizedForValidation);
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors.map(e => e.message).join(', '));
        return false;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      const payload: any = {
        ...updates,
        startLocation: (updates as any).origin ?? (updates as any).startLocation,
        endLocation: (updates as any).destination ?? (updates as any).endLocation,
        type: updates?.type ? (updates.type as any).toString().toUpperCase() : undefined,
        mode: updates?.mode ? (updates.mode as any).toString().toUpperCase() : undefined,
        cost: typeof (updates as any).cost === 'number' ? (updates as any).cost.toFixed(2) : (updates as any).cost,
        calculatedTotal: typeof (updates as any).calculatedTotal === 'number' ? (updates as any).calculatedTotal.toFixed(2) : (updates as any).calculatedTotal,
        estimatedDeliveryDate: normalizeDate((updates as any).estimatedDeliveryDate || (updates as any).deliveryDate),
      };
      delete payload.origin;
      delete payload.destination;

      const response = await fetch(`/api/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        await fetchShipments(initialFilters);
        return true;
      } else {
        setError(data.message || 'Failed to update shipment');
        return false;
      }
    } catch (err) {
      setError('Network error while updating shipment');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete shipment
  const deleteShipment = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/shipments/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        await fetchShipments(initialFilters);
        return true;
      } else {
        setError(data.message || 'Failed to delete shipment');
        return false;
      }
    } catch (err) {
      setError('Network error while deleting shipment');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Mark as delivered
  const markDelivered = async (id: string, deliveryDate?: string): Promise<boolean> => {
    // Client-side validation
    try {
      markDeliveredSchema.parse({ deliveryDate });
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors.map(e => e.message).join(', '));
        return false;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/shipments/${id}/deliver`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryDate }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        await fetchShipments(initialFilters);
        return true;
      } else {
        setError(data.message || 'Failed to mark as delivered');
        return false;
      }
    } catch (err) {
      setError('Network error while marking delivered');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch shipments on mount
  useEffect(() => {
    fetchShipments(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    shipments,
    stats,
    isLoading,
    error,
    totalPages,
    currentPage,
    fetchShipments,
    fetchStats,
    createShipment,
    updateShipment,
    deleteShipment,
    markDelivered,
  };
};
