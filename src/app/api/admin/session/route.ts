import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('mada-flash-admin-session')?.value;
    console.log('[SESSION] Cookie value:', sessionId ? 'present (' + sessionId.substring(0, 20) + '...)' : 'missing');

    if (!sessionId) {
      console.log('[SESSION] No session cookie found');
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      );
    }

    const user = getSession(sessionId);
    console.log('[SESSION] User from token:', user ? user.username : 'null');

    if (!user) {
      const response = NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      );

      // Clear invalid session cookie
      response.cookies.set('mada-flash-admin-session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });

      return response;
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
