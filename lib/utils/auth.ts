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
