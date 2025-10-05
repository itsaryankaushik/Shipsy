import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validators';
import { userService } from '@/lib/services/UserService';
import { COOKIE_OPTIONS } from '@/lib/utils/constants';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Validation failed', error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await userService.login(parsed.data);

    const response = { success: true, data: { user: result.user, tokens: result.tokens }, message: 'Login successful' };
    const nextResponse = NextResponse.json(response);
    nextResponse.cookies.set('access_token', result.tokens.accessToken, { ...COOKIE_OPTIONS, maxAge: 4 * 60 * 60 });
    nextResponse.cookies.set('refresh_token', result.tokens.refreshToken, { ...COOKIE_OPTIONS, maxAge: 15 * 24 * 60 * 60 });
    return nextResponse;
  } catch (err: any) {
    console.error('Login error', err);
    return NextResponse.json({ success: false, message: err?.message || 'Internal server error' }, { status: 500 });
  }
}
