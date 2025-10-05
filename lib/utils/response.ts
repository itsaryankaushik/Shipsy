import { NextResponse } from 'next/server';
import { ApiResponse, ApiError, PaginationMeta, HttpStatus, ErrorCode } from '@/types/api.types';
import { HTTP_STATUS, ERROR_CODES, API_MESSAGES } from './constants';
import { ZodError } from 'zod';

/**
 * API Response Utilities
 * Standardized response helpers for API routes
 */

/**
 * Success response with data
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = HTTP_STATUS.OK
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message: message || API_MESSAGES.SUCCESS,
      data,
    },
    { status }
  );
}

/**
 * Success response with pagination
 */
export function paginatedResponse<T>(
  items: T[],
  meta: PaginationMeta,
  message?: string
): NextResponse<ApiResponse<{ items: T[]; meta: PaginationMeta }>> {
  return NextResponse.json(
    {
      success: true,
      message: message || API_MESSAGES.SUCCESS,
      data: { items, meta },
      meta,
    },
    { status: HTTP_STATUS.OK }
  );
}

/**
 * Created response (201)
 */
export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message: message || API_MESSAGES.CREATED,
      data,
    },
    { status: HTTP_STATUS.CREATED }
  );
}

/**
 * No content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
}

/**
 * Error response
 */
export function errorResponse(
  message: string,
  code: string = ERROR_CODES.INTERNAL_ERROR,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  details?: Record<string, any>
): NextResponse<ApiResponse> {
  const error: ApiError = {
    code,
    message,
    details,
  };

  return NextResponse.json(
    {
      success: false,
      message,
      error,
    },
    { status }
  );
}

/**
 * Validation error response (422)
 */
export function validationErrorResponse(
  errors: Record<string, string> | ZodError
): NextResponse<ApiResponse> {
  let errorDetails: Record<string, any>;

  if (errors instanceof ZodError) {
    errorDetails = errors.errors.reduce((acc, err) => {
      const path = err.path.join('.');
      acc[path] = err.message;
      return acc;
    }, {} as Record<string, string>);
  } else {
    errorDetails = errors;
  }

  return errorResponse(
    API_MESSAGES.VALIDATION_ERROR,
    ERROR_CODES.VALIDATION_ERROR,
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    errorDetails
  );
}

/**
 * Unauthorized error response (401)
 */
export function unauthorizedResponse(
  message: string = API_MESSAGES.UNAUTHORIZED
): NextResponse<ApiResponse> {
  return errorResponse(
    message,
    ERROR_CODES.UNAUTHORIZED,
    HTTP_STATUS.UNAUTHORIZED
  );
}

/**
 * Forbidden error response (403)
 */
export function forbiddenResponse(
  message: string = API_MESSAGES.FORBIDDEN
): NextResponse<ApiResponse> {
  return errorResponse(
    message,
    ERROR_CODES.FORBIDDEN,
    HTTP_STATUS.FORBIDDEN
  );
}

/**
 * Not found error response (404)
 */
export function notFoundResponse(
  message: string = API_MESSAGES.NOT_FOUND
): NextResponse<ApiResponse> {
  return errorResponse(
    message,
    ERROR_CODES.NOT_FOUND,
    HTTP_STATUS.NOT_FOUND
  );
}

/**
 * Conflict error response (409)
 */
export function conflictResponse(
  message: string
): NextResponse<ApiResponse> {
  return errorResponse(
    message,
    ERROR_CODES.CONFLICT,
    HTTP_STATUS.CONFLICT
  );
}

/**
 * Bad request error response (400)
 */
export function badRequestResponse(
  message: string
): NextResponse<ApiResponse> {
  return errorResponse(
    message,
    ERROR_CODES.VALIDATION_ERROR,
    HTTP_STATUS.BAD_REQUEST
  );
}

/**
 * Internal server error response (500)
 */
export function internalErrorResponse(
  message: string = API_MESSAGES.INTERNAL_ERROR,
  error?: Error
): NextResponse<ApiResponse> {
  const details = process.env.NODE_ENV === 'development' && error
    ? {
        message: error.message,
        stack: error.stack,
      }
    : undefined;

  return errorResponse(
    message,
    ERROR_CODES.INTERNAL_ERROR,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details
  );
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Handle async route errors
 */
export function handleRouteError(error: unknown): NextResponse<ApiResponse> {
  console.error('Route error:', error);

  if (error instanceof ZodError) {
    return validationErrorResponse(error);
  }

  if (error instanceof Error) {
    return internalErrorResponse(error.message, error);
  }

  return internalErrorResponse();
}
