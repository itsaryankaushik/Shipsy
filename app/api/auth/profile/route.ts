import { NextRequest, NextResponse } from 'next/server';
import { updateProfileSchema } from '@/lib/validators';
import { requireAuth } from '@/lib/utils/requireAuth';
import { userService } from '@/lib/services/UserService';

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request as any);
    if (!auth.authenticated) return auth.response as NextResponse;

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Validation failed', error: parsed.error.flatten() }, { status: 400 });
    }

  const user = await userService.updateProfile(auth.user!.userId, parsed.data);
    return NextResponse.json({ success: true, data: user, message: 'Profile updated successfully' });
  } catch (err: any) {
    console.error('Update profile error', err);
    return NextResponse.json({ success: false, message: err?.message || 'Internal server error' }, { status: 500 });
  }
}
