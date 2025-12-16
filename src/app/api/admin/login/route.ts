import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      );
    }

    const user = validateCredentials(username, password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    const sessionId = createSession(user);
    console.log('[LOGIN] Created session token:', sessionId.substring(0, 30) + '...');

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      sessionId,
    });

    // Set session cookie - use root path so it's sent with API requests
    console.log('[LOGIN] Setting cookie with path: /');
    response.cookies.set('mada-flash-admin-session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
