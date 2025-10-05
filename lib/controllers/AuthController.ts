import { NextRequest, NextResponse } from 'next/server';
import { BaseController } from './BaseController';
import { userService } from '@/lib/services/UserService';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '@/lib/validators/auth.validator';
import { generateAuthTokens } from '@/lib/utils/auth';
import { COOKIE_OPTIONS } from '@/lib/utils/constants';

/**
 * AuthController
 * Handles authentication-related HTTP requests
 */
class AuthController extends BaseController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Register');

      // Parse and validate body
      const body = await this.parseBody(request);
      const validation = this.validateBody(registerSchema, body);

      if (!validation.valid) {
        return validation.response!;
      }

      // Register user
      const result = await userService.register(validation.data);

      if (!result.success) {
        return this.error(result.message, result.code, 400);
      }

      // Create response with cookies
      const response = this.success(
        {
          user: result.data!.user,
          tokens: result.data!.tokens,
        },
        'User registered successfully'
      );

      // Set HTTP-only cookies
      const nextResponse = NextResponse.json(response, { status: 201 });
      nextResponse.cookies.set('access_token', result.data!.tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60, // 15 minutes
      });
      nextResponse.cookies.set('refresh_token', result.data!.tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return nextResponse;
    } catch (error) {
      return this.handleError(error, 'register');
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Login');

      // Parse and validate body
      const body = await this.parseBody(request);
      const validation = this.validateBody(loginSchema, body);

      if (!validation.valid) {
        return validation.response!;
      }

      // Login user
      const result = await userService.login(validation.data);

      if (!result.success) {
        return this.error(result.message, result.code, 401);
      }

      // Create response with cookies
      const response = this.success(
        {
          user: result.data!.user,
          tokens: result.data!.tokens,
        },
        'Login successful'
      );

      const nextResponse = NextResponse.json(response);
      nextResponse.cookies.set('access_token', result.data!.tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60,
      });
      nextResponse.cookies.set('refresh_token', result.data!.tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60,
      });

      return nextResponse;
    } catch (error) {
      return this.handleError(error, 'login');
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Logout');

      // Clear cookies
      const response = this.success(null, 'Logout successful');
      const nextResponse = NextResponse.json(response);
      
      nextResponse.cookies.delete('access_token');
      nextResponse.cookies.delete('refresh_token');

      return nextResponse;
    } catch (error) {
      return this.handleError(error, 'logout');
    }
  }

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  async me(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Get Me');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Get user details
      const result = await userService.getUserById(auth.user!.userId);

      if (!result.success) {
        return this.notFound(result.message);
      }

      return this.success(result.data, 'User retrieved successfully');
    } catch (error) {
      return this.handleError(error, 'me');
    }
  }

  /**
   * Update user profile
   * PATCH /api/auth/profile
   */
  async updateProfile(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Update Profile');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Parse and validate body
      const body = await this.parseBody(request);
      const validation = this.validateBody(updateProfileSchema, body);

      if (!validation.valid) {
        return validation.response!;
      }

      // Update profile
      const result = await userService.updateProfile(auth.user!.userId, validation.data);

      if (!result.success) {
        return this.error(result.message, result.code, 400);
      }

      return this.success(result.data, 'Profile updated successfully');
    } catch (error) {
      return this.handleError(error, 'updateProfile');
    }
  }

  /**
   * Change password
   * POST /api/auth/change-password
   */
  async changePassword(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Change Password');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Parse and validate body
      const body = await this.parseBody(request);
      const validation = this.validateBody(changePasswordSchema, body);

      if (!validation.valid) {
        return validation.response!;
      }

      // Change password
      const result = await userService.changePassword(
        auth.user!.userId,
        validation.data.currentPassword,
        validation.data.newPassword
      );

      if (!result.success) {
        return this.error(result.message, result.code, 400);
      }

      return this.success(null, 'Password changed successfully');
    } catch (error) {
      return this.handleError(error, 'changePassword');
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refreshToken(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Refresh Token');

      // Get refresh token from cookies or body
      let refreshToken = request.cookies.get('refresh_token')?.value;
      
      if (!refreshToken) {
        const body = await this.parseBody(request);
        refreshToken = body.refreshToken;
      }

      if (!refreshToken) {
        return this.unauthorized('Refresh token required');
      }

      // Verify refresh token
      const result = await userService.verifyAndGetUser(refreshToken);

      if (!result.success || !result.data) {
        return this.unauthorized('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = generateAuthTokens({
        userId: result.data.id,
        email: result.data.email,
      });

      // Create response with new cookies
      const response = this.success(
        { tokens },
        'Token refreshed successfully'
      );

      const nextResponse = NextResponse.json(response);
      nextResponse.cookies.set('access_token', tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60,
      });
      nextResponse.cookies.set('refresh_token', tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60,
      });

      return nextResponse;
    } catch (error) {
      return this.handleError(error, 'refreshToken');
    }
  }
}

// Export singleton instance
export const authController = new AuthController();
