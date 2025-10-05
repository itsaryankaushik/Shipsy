import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const response = { success: true, data: null, message: 'Logout successful' };
    const nextResponse = NextResponse.json(response);
    nextResponse.cookies.delete('access_token');
    nextResponse.cookies.delete('refresh_token');
    return nextResponse;
  } catch (err: any) {
    console.error('Logout error', err);
    return NextResponse.json({ success: false, message: err?.message || 'Internal server error' }, { status: 500 });
  }
}
