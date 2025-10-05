'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { StatsCard } from '@/components/dashboard';
import { LoadingSpinner, ErrorMessage } from '@/components/ui';
import { useAuth, useShipments } from '@/hooks';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { stats, fetchStats, isLoading: statsLoading, error } = useShipments();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated]); // Remove router from dependencies

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Remove fetchStats from dependencies

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading..." />
      </div>
    );
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
                title="Total Shipments"
                value={stats.total}
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
                value={stats.pending}
                subtitle={`${((stats.pending / stats.total) * 100).toFixed(1)}% of total`}
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
                value={stats.delivered}
                subtitle={`${((stats.delivered / stats.total) * 100).toFixed(1)}% of total`}
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
                    <span className="text-gray-600">Domestic</span>
                    <span className="font-semibold text-gray-900">{stats.byType.domestic}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">International</span>
                    <span className="font-semibold text-gray-900">{stats.byType.international}</span>
                  </div>
                </div>
              </div>

              {/* By Mode */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipments by Mode</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">✈️ Air</span>
                    <span className="font-semibold text-gray-900">{stats.byMode.air}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">🚢 Sea</span>
                    <span className="font-semibold text-gray-900">{stats.byMode.sea}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">🚚 Road</span>
                    <span className="font-semibold text-gray-900">{stats.byMode.road}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">🚂 Rail</span>
                    <span className="font-semibold text-gray-900">{stats.byMode.rail}</span>
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
