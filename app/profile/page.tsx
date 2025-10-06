'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Button, PageLoader, ErrorMessage } from '@/components/ui';
import { useAuth } from '@/hooks';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, error: authError } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return <PageLoader text="Loading profile..." />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">
            View your account information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          {/* Error Message */}
          {authError && (
            <div className="mb-6">
              <ErrorMessage message={authError} />
            </div>
          )}

          <div className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Email
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                {user.email}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Name (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Full Name
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                {user.name || 'Not provided'}
              </div>
            </div>

            {/* Phone (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Phone Number
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                {user.phone || 'Not provided'}
              </div>
            </div>

            {/* Account Info */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Account Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Member since:</span>{' '}
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p>
                  <span className="font-medium">Last updated:</span>{' '}
                  {new Date(user.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Info: Profile fields are read-only */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 italic">
                Profile information is read-only. Contact support to make changes.
              </p>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Security</h2>
          <p className="text-gray-600 mb-4">
            Manage your password and security settings
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/change-password')}
          >
            Change Password
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
