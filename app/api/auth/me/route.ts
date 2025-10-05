import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/lib/controllers/AuthController';

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return authController.me(request);
}
