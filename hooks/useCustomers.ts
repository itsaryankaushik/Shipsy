'use client';

import { useState, useEffect, useCallback } from 'react';
import { createCustomerSchema, updateCustomerSchema, listCustomersSchema, searchCustomerSchema } from '@/lib/validators';
import { ZodError } from 'zod';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerFilters {
  page?: number;
  limit?: number;
}

interface UseCustomersReturn {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalCustomers: number;
  fetchCustomers: (filters?: CustomerFilters) => Promise<void>;
  searchCustomers: (query: string) => Promise<void>;
  createCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;
  fetchCustomerStats: () => Promise<{ totalCustomers: number } | null>;
}

export const useCustomers = (initialFilters?: CustomerFilters): UseCustomersReturn => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Fetch customers with pagination
  const fetchCustomers = useCallback(async (filters?: CustomerFilters) => {
    // Validate query params client-side when provided
    try {
      if (filters) {
        // transform filters to match expected string inputs used by schema
        const parsed = {
          page: filters.page ? String(filters.page) : undefined,
          limit: filters.limit ? String(filters.limit) : undefined,
        };
        listCustomersSchema.parse(parsed);
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
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));

      const response = await fetch(`/api/customers?${params.toString()}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        // Handle paginated response format: { success, data: { items, meta } }
        const items = data.data?.items || data.data || [];
        const meta = data.data?.meta || data.meta || {};
        
        setCustomers(Array.isArray(items) ? items : []);
        setTotalPages(meta.totalPages || 1);
        setCurrentPage(meta.page || filters?.page || 1);
        setTotalCustomers(meta.total || 0);
      } else {
        setError(data.message || 'Failed to fetch customers');
      }
    } catch (err) {
      setError('Network error while fetching customers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search customers
  const searchCustomers = useCallback(async (query: string) => {
    // Client-side validation
    try {
      searchCustomerSchema.parse({ query });
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors.map(e => e.message).join(', '));
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      if (!query.trim()) {
        await fetchCustomers(initialFilters);
        return;
      }

      const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setCustomers(data.data);
        setTotalPages(1);
        setCurrentPage(1);
      } else {
        setError(data.message || 'Search failed');
      }
    } catch (err) {
      setError('Network error during search');
    } finally {
      setIsLoading(false);
    }
  }, [fetchCustomers, initialFilters]);

  // Create customer
  const createCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    // Client-side validation
    try {
      createCustomerSchema.parse(customerData);
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors.map(e => e.message).join(', '));
        return false;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCustomers(initialFilters);
        return true;
      } else {
        setError(data.message || 'Failed to create customer');
        return false;
      }
    } catch (err) {
      setError('Network error while creating customer');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update customer
  const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<boolean> => {
    // Client-side validation
    try {
      updateCustomerSchema.parse(updates);
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors.map(e => e.message).join(', '));
        return false;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCustomers(initialFilters);
        return true;
      } else {
        setError(data.message || 'Failed to update customer');
        return false;
      }
    } catch (err) {
      setError('Network error while updating customer');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete customer
  const deleteCustomer = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCustomers(initialFilters);
        return true;
      } else {
        setError(data.message || 'Failed to delete customer');
        return false;
      }
    } catch (err) {
      setError('Network error while deleting customer');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch customer statistics
  const fetchCustomerStats = async (): Promise<{ totalCustomers: number } | null> => {
    try {
      const response = await fetch('/api/customers/stats', {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      console.error('Fetch customer stats error:', err);
      return null;
    }
  };

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    customers,
    isLoading,
    error,
    totalPages,
    currentPage,
    totalCustomers,
    fetchCustomers,
    searchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    fetchCustomerStats,
  };
};
