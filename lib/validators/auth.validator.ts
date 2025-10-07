import { z } from 'zod';

/**
 * Auth Validators
 * Zod schemas for authentication-related operations
 */

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

// Register validation schema
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .trim()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name too long'),
  phone: z
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number too long')
    .regex(/^\+?[1-9]\d{9,12}$/, 'Invalid phone number format (must be 10-13 digits, optional + prefix)'),
});

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .trim()
    .email('Invalid email format')
    .toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password too long')
      .regex(
        passwordRegex,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Update profile schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name too long')
    .optional(),
  phone: z
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number too long')
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format (must be 10-15 digits, optional + prefix)')
    .optional(),
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Export inferred types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
