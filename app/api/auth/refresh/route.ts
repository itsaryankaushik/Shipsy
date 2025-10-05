import { NextRequest, NextResponse } from 'next/server';
import { refreshTokenSchema } from '@/lib/validators';
import { userService } from '@/lib/services/UserService';
import { generateAuthTokens } from '@/lib/utils/auth';
import { COOKIE_OPTIONS } from '@/lib/utils/constants';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    let body: any = {};
    try { body = await request.json(); } catch { body = {}; }

    let refreshToken = request.cookies.get('refresh_token')?.value || body.refreshToken;
    if (!refreshToken) return NextResponse.json({ success: false, message: 'Refresh token required' }, { status: 401 });

    const user = await userService.verifyAndGetUser(refreshToken);
    if (!user) return NextResponse.json({ success: false, message: 'Invalid refresh token' }, { status: 401 });

    const tokens = generateAuthTokens({ userId: user.id, email: user.email });
    const response = { success: true, data: { tokens }, message: 'Token refreshed successfully' };
    const nextResponse = NextResponse.json(response);
    nextResponse.cookies.set('access_token', tokens.accessToken, { ...COOKIE_OPTIONS, maxAge: 4 * 60 * 60 });
    nextResponse.cookies.set('refresh_token', tokens.refreshToken, { ...COOKIE_OPTIONS, maxAge: 15 * 24 * 60 * 60 });
    return nextResponse;
  } catch (err: any) {
    console.error('Refresh token error', err);
    return NextResponse.json({ success: false, message: err?.message || 'Internal server error' }, { status: 500 });
  }
}
