'use client';

import { useState, useEffect, useCallback } from 'react';
import { loginSchema, registerSchema, changePasswordSchema, updateProfileSchema } from '@/lib/validators';
import { ZodError } from 'zod';
import { useRouter } from 'next/navigation';
import { scheduleTokenRefresh, cancelTokenRefresh } from '@/lib/utils/auth';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

// Helper function to extract error messages from API responses
const extractErrorMessage = (data: any, defaultMessage: string): string => {
  if (data.message && typeof data.message === 'string') {
    return data.message;
  }
  if (data.error?.message && typeof data.error.message === 'string') {
    return data.error.message;
  }
  if (data.error?.details && typeof data.error.details === 'object') {
    const details = Object.entries(data.error.details)
      .map(([field, messages]) => {
        if (Array.isArray(messages)) {
          return `${field}: ${messages.join(', ')}`;
        }
        return `${field}: ${messages}`;
      })
      .join('; ');
    if (details) return details;
  }
  if (data.errors && Array.isArray(data.errors)) {
    return data.errors.map((err: any) => err.message || err).join(', ');
  }
  if (data.error && typeof data.error === 'string') {
    return data.error;
  }
  return defaultMessage;
};

export const useAuth = () => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Handle token refresh callback
  const handleTokenRefresh = useCallback((newAccessToken?: string) => {
    if (newAccessToken) {
      setAccessToken(newAccessToken);
      // Token refreshed successfully, keep user authenticated
    } else {
      // Refresh failed, clear auth state
      setAccessToken(null);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  }, []);

  // Fetch current user
  const fetchUser = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.data?.accessToken;
        setState({
          user: data.data,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        // Schedule background token refresh
        if (token) {
          setAccessToken(token);
          scheduleTokenRefresh(token, handleTokenRefresh);
        }
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: 'Failed to fetch user',
      });
    }
  }, []);

  // Login
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    // Client-side validation
    try {
      loginSchema.parse(credentials);
    } catch (err) {
      if (err instanceof ZodError) {
        setState((prev) => ({ ...prev, isLoading: false, error: err.errors.map(e => e.message).join(', ') }));
        return false;
      }
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.data.tokens?.accessToken;
        setState({
          user: data.data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        // Schedule background token refresh
        if (token) {
          setAccessToken(token);
          scheduleTokenRefresh(token, handleTokenRefresh);
        }
        return true;
      } else {
        // Extract error message from response
        let errorMessage = data.message || 'Login failed';

        if (data.error?.details) {
          const details = Object.values(data.error.details).join(', ');
          errorMessage = details || errorMessage;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return false;
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Network error during login',
      }));
      return false;
    }
  };

  // Register
  const register = async (data: RegisterData): Promise<boolean> => {
    // Client-side validation
    try {
      registerSchema.parse(data);
    } catch (err) {
      if (err instanceof ZodError) {
        setState((prev) => ({ ...prev, isLoading: false, error: err.errors.map(e => e.message).join(', ') }));
        return false;
      }
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const responseData = await response.json();

      if (response.ok) {
        const token = responseData.data.tokens?.accessToken;
        setState({
          user: responseData.data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        // Schedule background token refresh
        if (token) {
          setAccessToken(token);
          scheduleTokenRefresh(token, handleTokenRefresh);
        }
        return true;
      } else {
        // Extract detailed error message from validation errors if available
        let errorMessage = responseData.message || 'Registration failed';

        if (responseData.error?.details) {
          const details = Object.values(responseData.error.details).join(', ');
          errorMessage = details || errorMessage;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return false;
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Network error during registration',
      }));
      return false;
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Cancel any scheduled token refresh
      cancelTokenRefresh();
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setAccessToken(null);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });

      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<Pick<User, 'name' | 'phone'>>): Promise<boolean> => {
    // Client-side validation
    try {
      updateProfileSchema.parse(updates);
    } catch (err) {
      if (err instanceof ZodError) {
        setState((prev) => ({ ...prev, isLoading: false, error: err.errors.map(e => e.message).join(', ') }));
        return false;
      }
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setState((prev) => ({
          ...prev,
          user: data.data,
          isLoading: false,
          error: null,
        }));
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Update failed',
        }));
        return false;
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Network error during update',
      }));
      return false;
    }
  };

  // Change password
  const changePassword = async (passwords: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; error?: string }> => {
    // Client-side validation
    try {
      changePasswordSchema.parse(passwords);
    } catch (err) {
      if (err instanceof ZodError) {
        return { success: false, error: err.errors.map(e => e.message).join(', ') };
      }
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwords),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        const errorMessage = extractErrorMessage(data, 'Failed to change password');
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Cleanup: cancel token refresh on unmount
  useEffect(() => {
    return () => {
      cancelTokenRefresh();
    };
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refetch: fetchUser,
  };
};
