'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Button, Input, LoadingSpinner, ErrorMessage } from '@/components/ui';
import { useAuth } from '@/hooks';
import { validateProfileForm } from '@/lib/utils/frontendValidation';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, updateProfile, error: authError } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (field: 'name' | 'phone', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (successMessage) setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation before API call
    const validation = validateProfileForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return; // Don't call API if validation fails
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage(null);

    const success = await updateProfile(formData);
    
    setIsSubmitting(false);

    if (success) {
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    }
    // Error is handled by useAuth and displayed via authError
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
    setErrors({});
    setSuccessMessage(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading..." />
      </div>
    );
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
            Manage your account information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {authError && isEditing && (
            <div className="mb-6">
              <ErrorMessage message={authError} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Name */}
            <Input
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              placeholder="Enter your full name"
              disabled={!isEditing}
              required
              fullWidth
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
              placeholder="+1234567890 (10-15 digits)"
              disabled={!isEditing}
              fullWidth
            />

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

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {!isEditing ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </form>
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
