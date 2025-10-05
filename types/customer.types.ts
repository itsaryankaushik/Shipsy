/**
 * Customer Types
 * Types specific to customer domain
 */

import { Customer as CustomerSchema } from '@/lib/db/schema';

// Re-export database types
export type Customer = CustomerSchema;

// Customer without sensitive data (for API responses)
export type CustomerPublic = Omit<Customer, never>;

// Customer creation data
export interface CreateCustomerData {
  userId: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
}

// Customer update data
export interface UpdateCustomerData {
  name?: string;
  phone?: string;
  address?: string;
  email?: string;
}

// Customer with related data
export interface CustomerWithShipments extends Customer {
  shipments?: Array<{
    id: string;
    type: string;
    mode: string;
    isDelivered: boolean;
    createdAt: Date;
  }>;
  _count?: {
    shipments: number;
  };
}

// Customer list filters
export interface CustomerFilters {
  userId?: string;
  search?: string;
  phone?: string;
  email?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

// Customer statistics
export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number; // Customers with shipments
  inactiveCustomers: number;
  averageShipmentsPerCustomer: number;
  topCustomers: Array<{
    customer: Customer;
    shipmentsCount: number;
    totalSpent: number;
  }>;
}

// Customer search result
export interface CustomerSearchResult {
  customer: Customer;
  relevanceScore?: number;
  matchedField?: 'name' | 'phone' | 'email' | 'address';
}

// Customer export data
export interface CustomerExportData {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalShipments: number;
  totalSpent: string;
  createdAt: string;
}
