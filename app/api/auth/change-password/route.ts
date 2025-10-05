import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/lib/controllers/AuthController';

/**
 * POST /api/auth/change-password
 * Change user password (requires current password)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return authController.changePassword(request);
}
