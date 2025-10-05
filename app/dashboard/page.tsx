'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { StatsCard } from '@/components/dashboard';
import { PageLoader, LoadingSpinner, ErrorMessage } from '@/components/ui';
import { useAuth, useShipments, useCustomers } from '@/hooks';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { stats, fetchStats, isLoading: statsLoading, error } = useShipments();
  const { fetchCustomerStats, isLoading: customerStatsLoading, error: customerError } = useCustomers();
  const [customerCount, setCustomerCount] = React.useState<number>(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated]); // Remove router from dependencies

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchCustomerStats().then((data: { totalCustomers: number } | null) => {
        if (data) setCustomerCount(data.totalCustomers);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Remove fetchStats from dependencies

  if (authLoading) {
    return <PageLoader text="Loading dashboard..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
        </div>

        {/* Error State */}
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={fetchStats}
          />
        )}

        {/* Loading State */}
        {statsLoading && !stats && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading statistics..." />
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Customers"
                value={customerCount}
                icon={
                  <svg 
                    className="h-6 w-6" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                    />
                  </svg>
                }
              />

              <StatsCard
                title="Total Shipments"
                value={stats.totalShipments}
                icon={
                  <svg 
                    className="h-6 w-6" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                    />
                  </svg>
                }
              />

              <StatsCard
                title="Pending Shipments"
                value={stats.pendingShipments}
                subtitle={stats.totalShipments > 0 ? `${((stats.pendingShipments / stats.totalShipments) * 100).toFixed(1)}% of total` : ''}
                icon={
                  <svg 
                    className="h-6 w-6" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                }
              />

              <StatsCard
                title="Delivered Shipments"
                value={stats.deliveredShipments}
                subtitle={stats.totalShipments > 0 ? `${((stats.deliveredShipments / stats.totalShipments) * 100).toFixed(1)}% of total` : ''}
                icon={
                  <svg 
                    className="h-6 w-6" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                }
              />

              <StatsCard
                title="Total Revenue"
                value={`$${stats.totalRevenue.toLocaleString()}`}
                subtitle={`Avg: $${stats.averageCost.toFixed(2)}`}
                icon={
                  <svg 
                    className="h-6 w-6" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                }
              />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Type */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipments by Type</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Local</span>
                    <span className="font-semibold text-gray-900">{stats.byType.LOCAL || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">National</span>
                    <span className="font-semibold text-gray-900">{stats.byType.NATIONAL || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">International</span>
                    <span className="font-semibold text-gray-900">{stats.byType.INTERNATIONAL || 0}</span>
                  </div>
                </div>
              </div>

              {/* By Mode */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipments by Mode</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">✈️ Air</span>
                    <span className="font-semibold text-gray-900">{stats.byMode.AIR || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">🚢 Water/Sea</span>
                    <span className="font-semibold text-gray-900">{stats.byMode.WATER || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">🚚 Land (Road/Rail)</span>
                    <span className="font-semibold text-gray-900">{stats.byMode.LAND || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
