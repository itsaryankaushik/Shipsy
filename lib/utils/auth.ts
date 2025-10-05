import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { JWT_CONFIG, BCRYPT_CONFIG } from './constants';
import { JWTPayload, AuthTokens } from '@/types/api.types';

/**
 * Authentication Utilities
 * JWT token generation/verification and password hashing
 */

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, BCRYPT_CONFIG.SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_CONFIG.ACCESS_TOKEN_SECRET, {
    expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
  } as SignOptions);
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(
    { userId: payload.userId },
    JWT_CONFIG.REFRESH_TOKEN_SECRET,
    {
      expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
    } as SignOptions
  );
}

/**
 * Generate both access and refresh tokens
 */
export function generateAuthTokens(payload: JWTPayload): AuthTokens {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Extract expiry from token (in seconds)
  const decoded = jwt.decode(accessToken) as any;
  const expiresIn = decoded.exp - decoded.iat;

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      JWT_CONFIG.ACCESS_TOKEN_SECRET
    ) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      JWT_CONFIG.REFRESH_TOKEN_SECRET
    ) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  return decoded.exp * 1000 < Date.now();
}

/**
 * Schedule automatic token refresh in the background
 * Refreshes token 2 minutes before expiry
 */
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleTokenRefresh(
  accessToken: string,
  onRefreshed: (newAccessToken?: string) => void
): void {
  try {
    const decoded = decodeToken(accessToken);
    if (!decoded || !decoded.exp) return;

    // Refresh 2 minutes before expiry
    const msUntilRefresh = decoded.exp * 1000 - Date.now() - 2 * 60 * 1000;
    if (msUntilRefresh <= 0) {
      // Token already near expiry, refresh now
      refreshTokenInBackground(onRefreshed);
      return;
    }

    // Clear any existing timer
    if (refreshTimer) clearTimeout(refreshTimer);

    // Schedule refresh
    refreshTimer = setTimeout(() => {
      refreshTokenInBackground(onRefreshed);
    }, msUntilRefresh);
  } catch (error) {
    console.error('Error scheduling token refresh', error);
  }
}

/**
 * Cancel scheduled token refresh
 */
export function cancelTokenRefresh(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

/**
 * Refresh token in background without page reload
 */
async function refreshTokenInBackground(
  onRefreshed: (newAccessToken?: string) => void
): Promise<void> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      const json = await response.json();
      const newAccessToken = json.data?.tokens?.accessToken;
      onRefreshed(newAccessToken);

      // Schedule next refresh if we got a new token
      if (newAccessToken) {
        scheduleTokenRefresh(newAccessToken, onRefreshed);
      }
    } else {
      // Refresh failed, clear auth state
      console.warn('Token refresh failed');
      onRefreshed(undefined);
    }
  } catch (error) {
    console.error('Error refreshing token', error);
    onRefreshed(undefined);
  }
}

/**
 * Fetch wrapper with automatic token refresh on 401
 * Use this instead of fetch for authenticated API calls
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  // Ensure credentials are included
  init.credentials = 'include';

  let response = await fetch(input, init);

  // If unauthorized, try to refresh token and retry once
  if (response.status === 401) {
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshResponse.ok) {
      // Retry original request with new token
      response = await fetch(input, init);
    }
  }

  return response;
}
