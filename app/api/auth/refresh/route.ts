import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/lib/controllers/AuthController';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return authController.refreshToken(request);
}
