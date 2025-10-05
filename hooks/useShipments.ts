'use client';

import { useState, useEffect, useCallback } from 'react';

interface Shipment {
  id: string;
  trackingNumber: string;
  customerId: string;
  origin: string;
  destination: string;
  type: 'domestic' | 'international';
  mode: 'air' | 'sea' | 'road' | 'rail';
  weight: number;
  cost: number;
  isDelivered: boolean;
  deliveryDate?: string | null;
  estimatedDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
}

interface ShipmentFilters {
  type?: 'domestic' | 'international';
  mode?: 'air' | 'sea' | 'road' | 'rail';
  isDelivered?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface ShipmentStats {
  total: number;
  pending: number;
  delivered: number;
  totalRevenue: number;
  averageCost: number;
  byType: { domestic: number; international: number };
  byMode: { air: number; sea: number; road: number; rail: number };
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
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipmentData),
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
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
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
