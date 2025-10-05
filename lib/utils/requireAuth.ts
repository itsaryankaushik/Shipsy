import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractBearerToken } from './auth';

export async function requireAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    let token = extractBearerToken(authHeader) || request.cookies.get('access_token')?.value || null;

    if (!token) {
      return { authenticated: false, response: NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 }) };
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return { authenticated: false, response: NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 }) };
    }

    return { authenticated: true, user: { userId: payload.userId, email: payload.email } };
  } catch (err: any) {
    console.error('requireAuth error', err);
    return { authenticated: false, response: NextResponse.json({ success: false, message: 'Authentication failed' }, { status: 401 }) };
  }
}

export default requireAuth;
