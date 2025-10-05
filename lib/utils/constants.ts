/**
 * Application Constants
 * Centralized configuration and constant values
 */

// JWT Configuration
export const JWT_CONFIG = {
  ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-change-in-production',
  REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-change-in-production',
  ACCESS_TOKEN_EXPIRY: '4h', // 4 hours
  REFRESH_TOKEN_EXPIRY: '15d', // 15 days
  ALGORITHM: 'HS256' as const,
};

// Bcrypt Configuration
export const BCRYPT_CONFIG = {
  SALT_ROUNDS: 12,
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Shipment Types
export const SHIPMENT_TYPES = {
  LOCAL: 'LOCAL',
  NATIONAL: 'NATIONAL',
  INTERNATIONAL: 'INTERNATIONAL',
} as const;

// Shipment Modes
export const SHIPMENT_MODES = {
  LAND: 'LAND',
  AIR: 'AIR',
  WATER: 'WATER',
} as const;

// API Response Messages
export const API_MESSAGES = {
  // Success messages
  SUCCESS: 'Operation successful',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  
  // Auth messages
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTER_SUCCESS: 'Registration successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  
  // Error messages
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have permission to access this resource',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
  
  // Specific errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already exists',
  PHONE_EXISTS: 'Phone number already exists',
  USER_NOT_FOUND: 'User not found',
  CUSTOMER_NOT_FOUND: 'Customer not found',
  SHIPMENT_NOT_FOUND: 'Shipment not found',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_EXPIRED: 'Token has expired',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
} as const;

// Cookie Names
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// Cookie Options
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

// Date Formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
};

// Regex Patterns
export const REGEX_PATTERNS = {
  PHONE: /^\+?[1-9]\d{9,14}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
};

// Environment
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Database
export const DATABASE_URL = process.env.DATABASE_URL || '';

// API Base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
