/**
 * Shipment Types
 * Types specific to shipment domain
 */

import { Shipment as ShipmentSchema, ShipmentType, ShipmentMode } from '@/lib/db/schema';

// Re-export database types
export type Shipment = ShipmentSchema;
export type { ShipmentType, ShipmentMode };

// Shipment without sensitive data (for API responses)
export type ShipmentPublic = Omit<Shipment, never>;

// Shipment creation data
export interface CreateShipmentData {
  userId: string;
  customerId: string;
  type: ShipmentType;
  mode: ShipmentMode;
  startLocation: string;
  endLocation: string;
  cost: string;
  calculatedTotal: string;
  deliveryDate?: Date | null;
}

// Shipment update data
export interface UpdateShipmentData {
  type?: ShipmentType;
  mode?: ShipmentMode;
  startLocation?: string;
  endLocation?: string;
  cost?: string;
  calculatedTotal?: string;
  deliveryDate?: Date | null;
  isDelivered?: boolean;
}

// Shipment with related data
export interface ShipmentWithRelations extends Shipment {
  customer?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Shipment list filters
export interface ShipmentFilters {
  userId?: string;
  customerId?: string;
  type?: ShipmentType;
  mode?: ShipmentMode;
  isDelivered?: boolean;
  startDate?: Date;
  endDate?: Date;
  minCost?: number;
  maxCost?: number;
  search?: string; // Search in locations
}

// Shipment statistics
export interface ShipmentStats {
  totalShipments: number;
  pendingShipments: number;
  deliveredShipments: number;
  totalRevenue: number;
  averageCost: number;
  byType: Record<ShipmentType, number>;
  byMode: Record<ShipmentMode, number>;
  recentShipments: Shipment[];
}

// Shipment statistics by period
export interface ShipmentStatsByPeriod {
  period: string; // e.g., "2025-01", "2025-W01"
  count: number;
  revenue: number;
  averageCost: number;
}

// Shipment dashboard data
export interface ShipmentDashboard {
  stats: ShipmentStats;
  byPeriod: ShipmentStatsByPeriod[];
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    shipmentsCount: number;
    totalSpent: number;
  }>;
  revenueByType: Record<ShipmentType, number>;
  revenueByMode: Record<ShipmentMode, number>;
}

// Shipment status timeline
export interface ShipmentTimeline {
  createdAt: Date;
  deliveryDate?: Date | null;
  isDelivered: boolean;
  daysInTransit?: number;
  estimatedDelivery?: Date;
}

// Shipment cost breakdown
export interface ShipmentCostBreakdown {
  baseCost: number;
  taxes: number;
  fees: number;
  discounts: number;
  total: number;
}

// Shipment export data
export interface ShipmentExportData {
  id: string;
  customerName: string;
  type: string;
  mode: string;
  startLocation: string;
  endLocation: string;
  cost: string;
  calculatedTotal: string;
  isDelivered: boolean;
  createdAt: string;
  deliveryDate: string;
}

// Shipment group (for analytics)
export interface ShipmentGroup {
  groupKey: string;
  groupValue: string;
  count: number;
  totalRevenue: number;
  averageCost: number;
  shipments: Shipment[];
}
