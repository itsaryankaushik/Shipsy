import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/lib/controllers/AuthController';

/**
 * PATCH /api/auth/profile
 * Update user profile (name, phone)
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  return authController.updateProfile(request);
}
