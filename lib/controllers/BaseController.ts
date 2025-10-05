import { NextRequest } from 'next/server';
import { ZodSchema } from 'zod';
import { validate } from '@/lib/utils/validation';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  internalErrorResponse,
} from '@/lib/utils/response';
import { verifyAccessToken } from '@/lib/utils/auth';
import { RequestContext } from '@/types/api.types';

/**
 * BaseController
 * Abstract base class for all controllers providing common request handling patterns
 */
export abstract class BaseController {
  /**
   * Extract and verify authentication token from request
   */
  protected async authenticate(request: NextRequest): Promise<RequestContext | null> {
    try {
      // Try to get token from Authorization header
      const authHeader = request.headers.get('authorization');
      let token: string | null = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }

      // If not in header, try to get from cookies
      if (!token) {
        token = request.cookies.get('access_token')?.value || null;
      }

      if (!token) {
        return null;
      }

      // Verify token
      const payload = verifyAccessToken(token);
      if (!payload) {
        return null;
      }

      return {
        userId: payload.userId,
        email: payload.email,
        name: '', // Will be populated if needed
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  /**
   * Require authentication - returns error response if not authenticated
   */
  protected async requireAuth(request: NextRequest) {
    const user = await this.authenticate(request);
    if (!user) {
      return {
        authenticated: false,
        response: unauthorizedResponse('Authentication required'),
      };
    }
    return { authenticated: true, user };
  }

  /**
   * Validate request body against schema
   */
  protected validateBody<T>(schema: ZodSchema<T>, data: unknown) {
    const result = validate(schema, data);
    if (!result.success) {
      return {
        valid: false,
        response: validationErrorResponse(result.errors),
      };
    }
    return { valid: true, data: result.data };
  }

  /**
   * Parse JSON body safely
   */
  protected async parseBody(request: NextRequest): Promise<any> {
    try {
      return await request.json();
    } catch (error) {
      throw new Error('Invalid JSON body');
    }
  }

  /**
   * Extract query parameters
   */
  protected getQueryParams(request: NextRequest): Record<string, string> {
    const { searchParams } = new URL(request.url);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }

  /**
   * Extract route parameters from URL
   */
  protected getRouteParam(request: NextRequest, paramName: string): string | null {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // This is a simplified version - Next.js provides params directly in route handlers
    // This method is mainly for reference
    return null;
  }

  /**
   * Handle errors uniformly
   */
  protected handleError(error: unknown, operation: string = 'operation') {
    console.error(`Controller error in ${operation}:`, error);

    if (error instanceof Error) {
      // Check for specific error messages
      if (error.message.includes('not found')) {
        return notFoundResponse(error.message);
      }
      if (error.message.includes('Unauthorized')) {
        return unauthorizedResponse(error.message);
      }
      if (error.message.includes('already exists')) {
        return errorResponse(error.message, 'CONFLICT', 409);
      }
      if (error.message.includes('Validation')) {
        return errorResponse(error.message, 'VALIDATION_ERROR', 400);
      }

      return internalErrorResponse(error.message, error);
    }

    return internalErrorResponse('An unexpected error occurred');
  }

  /**
   * Parse pagination parameters
   */
  protected getPaginationParams(params: Record<string, string>) {
    return {
      page: parseInt(params.page || '1', 10),
      limit: Math.min(parseInt(params.limit || '20', 10), 100),
    };
  }

  /**
   * Parse sort parameters
   */
  protected getSortParams(
    params: Record<string, string>,
    defaultSortBy: string = 'createdAt'
  ) {
    return {
      sortBy: params.sortBy || defaultSortBy,
      sortOrder: (params.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
    };
  }

  /**
   * Parse boolean parameter
   */
  protected getBooleanParam(params: Record<string, string>, key: string): boolean | undefined {
    if (!(key in params)) return undefined;
    return params[key] === 'true';
  }

  /**
   * Parse date parameter
   */
  protected getDateParam(params: Record<string, string>, key: string): Date | undefined {
    if (!(key in params)) return undefined;
    const date = new Date(params[key]);
    return isNaN(date.getTime()) ? undefined : date;
  }

  /**
   * Create success response with data
   */
  protected success<T>(data: T, message?: string) {
    return successResponse(data, message);
  }

  /**
   * Create error response
   */
  protected error(message: string, code: string = 'ERROR', status: number = 400) {
    return errorResponse(message, code, status);
  }

  /**
   * Create not found response
   */
  protected notFound(message: string = 'Resource not found') {
    return notFoundResponse(message);
  }

  /**
   * Create unauthorized response
   */
  protected unauthorized(message: string = 'Unauthorized') {
    return unauthorizedResponse(message);
  }

  /**
   * Log request for debugging
   */
  protected logRequest(request: NextRequest, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${context || 'Request'}] ${request.method} ${request.url}`);
    }
  }
}
