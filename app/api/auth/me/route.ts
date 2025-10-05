import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/requireAuth';
import { userService } from '@/lib/services/UserService';

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request as any);
    if (!auth.authenticated) {
      return auth.response as NextResponse;
    }

  const user = await userService.getUserById(auth.user!.userId);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: user, message: 'User retrieved successfully' });
  } catch (err: any) {
    console.error('Get me error', err);
    return NextResponse.json({ success: false, message: err?.message || 'Internal server error' }, { status: 500 });
  }
}
