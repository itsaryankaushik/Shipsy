'use client';

import React, { useEffect, useState, useCallback, useRef, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { CustomerCard } from '@/components/customers';
import { Button, PageLoader, LoadingSpinner, ErrorMessage, Pagination, SearchBar } from '@/components/ui';
import { useAuth, useCustomers } from '@/hooks';

// Lazy load heavy form component
const CustomerForm = lazy(() => import('@/components/customers/CustomerForm'));

export default function CustomersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { 
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
    deleteCustomer 
  } = useCustomers({ page: 1, limit: 9 });

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated]); // Remove router from dependencies

  // Debounced search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search by 500ms
    searchTimeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        searchCustomers(query);
      } else {
        fetchCustomers({ page: 1, limit: 9 });
      }
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove function dependencies to prevent re-creation

  const handlePageChange = (page: number) => {
    fetchCustomers({ page, limit: 9 });
  };

  const handleSubmitCustomer = async (data: any) => {
    let success;
    if (editingCustomer) {
      success = await updateCustomer(editingCustomer.id, data);
    } else {
      success = await createCustomer(data);
    }
    if (success) {
      setShowForm(false);
      setEditingCustomer(null);
    }
  };

  const handleEditCustomer = (id: string) => {
    const customer = customers.find(c => c.id === id);
    if (customer) {
      setEditingCustomer(customer);
      setShowForm(true);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      await deleteCustomer(id);
    }
  };

  if (authLoading) {
    return <PageLoader text="Loading customers..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-1">
              Manage your customers ({totalCustomers} total)
            </p>
          </div>
          <Button variant="primary" onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingCustomer(null);
            } else {
              setShowForm(true);
            }
          }}>
            {showForm ? 'Cancel' : '+ New Customer'}
          </Button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingCustomer ? 'Edit Customer' : 'Create New Customer'}
            </h2>
            <Suspense fallback={<LoadingSpinner size="md" />}>
              <CustomerForm
                initialData={editingCustomer}
                onSubmit={handleSubmitCustomer}
                onCancel={() => {
                  setShowForm(false);
                  setEditingCustomer(null);
                }}
                isLoading={isLoading}
              />
            </Suspense>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search customers by name, email, or phone..."
            fullWidth
          />
        </div>

        {/* Error State */}
        {error && <ErrorMessage message={error} onRetry={() => fetchCustomers({ page: currentPage, limit: 9 })} />}

        {/* Loading State */}
        {isLoading && customers.length === 0 && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading customers..." />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && customers.length === 0 && !searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No customers found</p>
            <Button variant="primary" className="mt-4" onClick={() => setShowForm(true)}>
              Create your first customer
            </Button>
          </div>
        )}

        {/* No Search Results */}
        {!isLoading && customers.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No customers match your search</p>
            <p className="text-gray-400 text-sm mt-2">Try a different search term</p>
          </div>
        )}

        {/* Customers Grid */}
        {customers.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onEdit={handleEditCustomer}
                  onDelete={handleDeleteCustomer}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !searchQuery && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
