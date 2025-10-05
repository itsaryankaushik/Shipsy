'use client';

import React, { useEffect, useState, useCallback, useRef, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { ShipmentCard } from '@/components/shipments';
import { Button, PageLoader, LoadingSpinner, ErrorMessage, Pagination, Select, SelectOption } from '@/components/ui';
import { useAuth, useShipments, useCustomers } from '@/hooks';

// Lazy load heavy form component
const ShipmentForm = lazy(() => import('@/components/shipments/ShipmentForm'));

export default function ShipmentsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { 
    shipments, 
    isLoading, 
    error, 
    totalPages, 
    currentPage,
    fetchShipments,
    createShipment,
    updateShipment,
    deleteShipment,
    markDelivered 
  } = useShipments({ page: 1, limit: 9 });
  
  const { customers } = useCustomers();

  const [showForm, setShowForm] = useState(false);
  const [editingShipment, setEditingShipment] = useState<any>(null);
  const [filters, setFilters] = useState({
    type: '',
    mode: '',
    isDelivered: '',
  });
  const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated]); // Remove router from dependencies

  // Debounced filter handler
  const handleFilterChange = useCallback((field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    
    // Clear previous timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }
    
    // Debounce filter by 300ms
    filterTimeoutRef.current = setTimeout(() => {
      const filterParams: any = { page: 1, limit: 9 };
      if (newFilters.type) filterParams.type = newFilters.type;
      if (newFilters.mode) filterParams.mode = newFilters.mode;
      if (newFilters.isDelivered) filterParams.isDelivered = newFilters.isDelivered === 'true';
      
      fetchShipments(filterParams);
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // Remove fetchShipments from dependencies

  const handlePageChange = (page: number) => {
    const filterParams: any = { page, limit: 9 };
    if (filters.type) filterParams.type = filters.type;
    if (filters.mode) filterParams.mode = filters.mode;
    if (filters.isDelivered) filterParams.isDelivered = filters.isDelivered === 'true';
    
    fetchShipments(filterParams);
  };

  const handleSubmitShipment = async (data: any) => {
    let success;
    if (editingShipment) {
      success = await updateShipment(editingShipment.id, data);
    } else {
      success = await createShipment(data);
    }
    if (success) {
      setShowForm(false);
      setEditingShipment(null);
    }
  };

  const handleEditShipment = (id: string) => {
    const shipment = shipments.find(s => s.id === id);
    if (shipment) {
      setEditingShipment(shipment);
      setShowForm(true);
    }
  };

  const handleDeleteShipment = async (id: string) => {
    if (confirm('Are you sure you want to delete this shipment?')) {
      await deleteShipment(id);
    }
  };

  const handleMarkDelivered = async (id: string) => {
    await markDelivered(id);
  };

  if (authLoading) {
    return <PageLoader text="Loading shipments..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const typeOptions: SelectOption[] = [
    { value: '', label: 'All Types' },
    { value: 'LOCAL', label: 'Local' },
    { value: 'NATIONAL', label: 'National' },
    { value: 'INTERNATIONAL', label: 'International' },
  ];

  const modeOptions: SelectOption[] = [
    { value: '', label: 'All Modes' },
    { value: 'AIR', label: 'Air' },
    { value: 'WATER', label: 'Water/Sea' },
    { value: 'LAND', label: 'Land (Road/Rail)' },
  ];

  const statusOptions: SelectOption[] = [
    { value: '', label: 'All Status' },
    { value: 'false', label: 'Pending' },
    { value: 'true', label: 'Delivered' },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shipments</h1>
            <p className="text-gray-600 mt-1">Manage all your shipments</p>
          </div>
          <Button variant="primary" onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingShipment(null);
            } else {
              setShowForm(true);
            }
          }}>
            {showForm ? 'Cancel' : '+ New Shipment'}
          </Button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingShipment ? 'Edit Shipment' : 'Create New Shipment'}
            </h2>
            <Suspense fallback={<LoadingSpinner size="md" />}>
              <ShipmentForm
                customers={customers}
                initialData={editingShipment}
                onSubmit={handleSubmitShipment}
                onCancel={() => {
                  setShowForm(false);
                  setEditingShipment(null);
                }}
                isLoading={isLoading}
              />
            </Suspense>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Type"
              options={typeOptions}
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              fullWidth
            />
            <Select
              label="Mode"
              options={modeOptions}
              value={filters.mode}
              onChange={(e) => handleFilterChange('mode', e.target.value)}
              fullWidth
            />
            <Select
              label="Status"
              options={statusOptions}
              value={filters.isDelivered}
              onChange={(e) => handleFilterChange('isDelivered', e.target.value)}
              fullWidth
            />
          </div>
        </div>

        {/* Error State */}
        {error && <ErrorMessage message={error} onRetry={() => fetchShipments({ page: currentPage, limit: 9 })} />}

        {/* Loading State */}
        {isLoading && shipments.length === 0 && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading shipments..." />
          </div>
        )}

        {/* Shipments Grid */}
        {!isLoading && shipments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No shipments found</p>
            <Button variant="primary" className="mt-4" onClick={() => setShowForm(true)}>
              Create your first shipment
            </Button>
          </div>
        )}

        {shipments.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shipments.map((shipment) => (
                <ShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  onEdit={handleEditShipment}
                  onDelete={handleDeleteShipment}
                  onMarkDelivered={handleMarkDelivered}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
