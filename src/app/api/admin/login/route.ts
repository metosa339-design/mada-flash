import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, createSession } from '@/lib/auth';
import { loginSchema, validateData } from '@/lib/validations';
import { checkRateLimit, getClientIdentifier, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for auth (strict: 5 attempts per 15 minutes)
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId, 'auth');

    if (!rateLimit.success) {
      const response = NextResponse.json(
        { success: false, error: 'Trop de tentatives. Réessayez plus tard.' },
        { status: 429 }
      );
      Object.entries(getRateLimitHeaders(rateLimit)).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    const body = await request.json();

    // Validate input with Zod
    const validation = validateData(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: validation.errors },
        { status: 400 }
      );
    }

    const { username, password } = validation.data;
    const user = await validateCredentials(username, password);

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
