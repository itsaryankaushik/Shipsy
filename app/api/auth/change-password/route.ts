import { NextRequest, NextResponse } from 'next/server';
import { changePasswordSchema } from '@/lib/validators';
import { requireAuth } from '@/lib/utils/requireAuth';
import { userService } from '@/lib/services/UserService';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request as any);
    if (!auth.authenticated) return auth.response as NextResponse;

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Validation failed', error: parsed.error.flatten() }, { status: 400 });
    }

    if (!auth.user) return NextResponse.json({ success: false, message: 'Authentication error' }, { status: 401 });

    await userService.changePassword(auth.user.userId, { currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword });
    return NextResponse.json({ success: true, data: null, message: 'Password changed successfully' });
  } catch (err: any) {
    console.error('Change password error', err);
    return NextResponse.json({ success: false, message: err?.message || 'Internal server error' }, { status: 500 });
  }
}
