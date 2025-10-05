import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/lib/controllers/AuthController';

/**
 * POST /api/auth/logout
 * Clear authentication cookies
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return authController.logout(request);
}
