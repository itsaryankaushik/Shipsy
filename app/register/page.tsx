'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, ErrorMessage, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/hooks';
import { validateRegisterForm } from '@/lib/utils/frontendValidation';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error: authError, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation before API call
    const validation = validateRegisterForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return; // Don't call API if validation fails
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { confirmPassword, ...registerData } = formData;
      const success = await register(registerData);
      
      if (success) {
        router.push('/dashboard');
      }
      // Error is handled by useAuth hook and displayed via authError
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="xl" text="Loading..." />
      </div>
    );
  }

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <svg 
              className="h-12 w-12 text-blue-600" 
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
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-700">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              placeholder="Enter your full name"
              fullWidth
              required
            />

            <Input
              label="Email address"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              placeholder="Enter your email"
              fullWidth
              required
            />

            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
              placeholder="+1234567890 (10-15 digits)"
              fullWidth
              required
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
              placeholder="Min 8 chars, uppercase, lowercase, number"
              fullWidth
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              fullWidth
              required
            />
          </div>

          {authError && (
            <ErrorMessage message={authError} />
          )}

          <div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting || isLoading}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
