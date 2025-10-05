import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/lib/controllers/AuthController';

/**
 * POST /api/auth/login
 * Authenticate user and return JWT tokens
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return authController.login(request);
}
