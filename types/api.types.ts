/**
 * API Types
 * Common types for API requests and responses
 */

// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

// API Error structure
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string; // Only in development
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Paginated response
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// Sort options
export interface SortOptions {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Filter options (generic)
export interface FilterOptions extends SortOptions {
  page: number;
  limit: number;
  search?: string;
}

// Request context (from middleware)
export interface RequestContext {
  userId: string;
  email: string;
  name: string;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Auth tokens response
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

// Login response
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
  };
  tokens: AuthTokens;
}

// Validation error
export interface ValidationError {
  field: string;
  message: string;
}

// HTTP Status Codes enum
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

// Error codes
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
}

// Query params for list endpoints
export interface ListQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Bulk operation response
export interface BulkOperationResponse {
  success: number;
  failed: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}
