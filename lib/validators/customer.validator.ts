import { z } from 'zod';

/**
 * Customer Validators
 * Zod schemas for customer-related operations
 */

// Base customer schema
const baseCustomerSchema = {
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name too long'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format (e.g., +1234567890)')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number too long'),
  address: z
    .string()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(1000, 'Address too long'),
  email: z
    .string()
    .trim()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .toLowerCase()
    .optional()
    .or(z.literal('')),
};

// Create customer validation schema
export const createCustomerSchema = z.object(baseCustomerSchema);

// Update customer validation schema (all fields optional)
export const updateCustomerSchema = z.object({
  name: baseCustomerSchema.name.optional(),
  phone: baseCustomerSchema.phone.optional(),
  address: baseCustomerSchema.address.optional(),
  email: baseCustomerSchema.email,
});

// List customers with pagination
export const listCustomersSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100)),
  search: z.string().max(255).optional(),
  sortBy: z.enum(['name', 'createdAt', 'phone']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Search customer schema
export const searchCustomerSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(255).transform((val) => val.trim()),
  page: z.string().optional().default('1').transform((val) => parseInt(val, 10)).pipe(z.number().int().positive().optional().default(1)),
  limit: z.string().optional().default('20').transform((val) => parseInt(val, 10)).pipe(z.number().int().positive().max(100).optional().default(20)),
});

// Customer ID param schema (for route params)
export const customerIdSchema = z.object({
  id: z.string().uuid('Invalid customer ID format'),
});

// Bulk delete schema
export const bulkDeleteCustomersSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one customer ID is required'),
});

// Export inferred types
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type ListCustomersInput = z.infer<typeof listCustomersSchema>;
export type SearchCustomerInput = z.infer<typeof searchCustomerSchema>;
export type CustomerIdInput = z.infer<typeof customerIdSchema>;
export type BulkDeleteCustomersInput = z.infer<typeof bulkDeleteCustomersSchema>;
