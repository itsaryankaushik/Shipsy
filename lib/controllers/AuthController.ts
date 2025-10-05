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

      const data = validation.data!;

      // Register user - service throws on error
      const result = await userService.register(data);

      // Create response with cookies
      const response = this.success(
        {
          user: result.user,
          tokens: result.tokens,
        },
        'User registered successfully'
      );

      // Set HTTP-only cookies
      const nextResponse = NextResponse.json(response, { status: 201 });
      nextResponse.cookies.set('access_token', result.tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60, // 15 minutes
      });
      nextResponse.cookies.set('refresh_token', result.tokens.refreshToken, {
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

      const data = validation.data!;

      // Login user - service throws on error
      const result = await userService.login(data);

      // Create response with cookies
      const response = this.success(
        {
          user: result.user,
          tokens: result.tokens,
        },
        'Login successful'
      );

      const nextResponse = NextResponse.json(response);
      nextResponse.cookies.set('access_token', result.tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60,
      });
      nextResponse.cookies.set('refresh_token', result.tokens.refreshToken, {
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

      // Get user details - service throws on error
      const user = await userService.getUserById(auth.user!.userId);

      if (!user) {
        return this.notFound('User not found');
      }

      return this.success(user, 'User retrieved successfully');
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

      const data = validation.data!;

      // Update profile - service throws on error
      const user = await userService.updateProfile(auth.user!.userId, data);

      return this.success(user, 'Profile updated successfully');
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

      const data = validation.data!;

      // Change password - service throws on error
      await userService.changePassword(auth.user!.userId, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

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

      // Verify refresh token - service throws on error
      const user = await userService.verifyAndGetUser(refreshToken);

      if (!user) {
        return this.unauthorized('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = generateAuthTokens({
        userId: user.id,
        email: user.email,
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
