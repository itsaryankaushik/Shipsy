import { ZodSchema, ZodError } from 'zod';
import { REGEX_PATTERNS } from './constants';

/**
 * Validation Utilities
 * Helper functions for data validation
 */

/**
 * Validate data against a Zod schema
 */
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {} as Record<string, string>);
      return { success: false, errors };
    }
    return { success: false, errors: { _error: 'Validation failed' } };
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return REGEX_PATTERNS.EMAIL.test(email);
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  return REGEX_PATTERNS.PHONE.test(phone);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8 && REGEX_PATTERNS.PASSWORD.test(password);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate date string (ISO 8601)
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate decimal number string
 */
export function isValidDecimal(value: string): boolean {
  const decimalRegex = /^\d+(\.\d{1,2})?$/;
  return decimalRegex.test(value) && parseFloat(value) >= 0;
}

/**
 * Sanitize string input (remove potentially harmful characters)
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/script/gi, ''); // Remove 'script' word
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  page: unknown,
  limit: unknown
): { page: number; limit: number } | { error: string } {
  const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page);
  const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    return { error: 'Invalid page number' };
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return { error: 'Invalid limit (must be between 1 and 100)' };
  }

  return { page: pageNum, limit: limitNum };
}

/**
 * Parse and validate sort parameters
 */
export function validateSortParams(
  sortBy: unknown,
  sortOrder: unknown,
  allowedFields: string[]
): { sortBy: string; sortOrder: 'asc' | 'desc' } | { error: string } {
  const sortByStr = String(sortBy || 'createdAt');
  const sortOrderStr = String(sortOrder || 'desc').toLowerCase();

  if (!allowedFields.includes(sortByStr)) {
    return { error: `Invalid sortBy field. Allowed: ${allowedFields.join(', ')}` };
  }

  if (sortOrderStr !== 'asc' && sortOrderStr !== 'desc') {
    return { error: 'sortOrder must be "asc" or "desc"' };
  }

  return { sortBy: sortByStr, sortOrder: sortOrderStr as 'asc' | 'desc' };
}

/**
 * Check if value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): string[] {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (isEmpty(data[field])) {
      missingFields.push(field);
    }
  }

  return missingFields;
}
