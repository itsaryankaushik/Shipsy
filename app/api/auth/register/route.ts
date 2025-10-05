import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/lib/controllers/AuthController';

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return authController.register(request);
}
