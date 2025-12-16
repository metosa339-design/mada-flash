// Simple authentication system for admin
// In production, use a proper authentication library like NextAuth.js

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'editor';
}

// Default admin credentials (change in production!)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'MadaFlash2024!',
};

const EDITOR_CREDENTIALS = {
  username: 'editor',
  password: 'Editor2024!',
};

const SESSION_COOKIE_NAME = 'mada-flash-admin-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Secret key for signing tokens (in production, use environment variable)
const SECRET_KEY = 'mada-flash-secret-key-2024';

// Token-based authentication (no server-side session storage needed)
interface TokenPayload {
  user: AdminUser;
  exp: number;
  sig: string;
}

// Simple hash function for signing
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function createSignature(user: AdminUser, exp: number): string {
  const data = `${user.id}:${user.username}:${user.role}:${exp}:${SECRET_KEY}`;
  return simpleHash(data);
}

export function validateCredentials(username: string, password: string): AdminUser | null {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    return { id: '1', username: 'admin', role: 'admin' };
  }
  if (username === EDITOR_CREDENTIALS.username && password === EDITOR_CREDENTIALS.password) {
    return { id: '2', username: 'editor', role: 'editor' };
  }
  return null;
}

// Create a token containing user data (stored in cookie)
export function createToken(user: AdminUser): string {
  const exp = Date.now() + SESSION_DURATION;
  const sig = createSignature(user, exp);
  const payload: TokenPayload = { user, exp, sig };
  // Base64 encode the JSON payload
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Verify and decode token from cookie
export function verifyToken(token: string): AdminUser | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const payload: TokenPayload = JSON.parse(decoded);

    // Check expiration
    if (Date.now() > payload.exp) {
      return null;
    }

    // Verify signature
    const expectedSig = createSignature(payload.user, payload.exp);
    if (payload.sig !== expectedSig) {
      return null;
    }

    return payload.user;
  } catch {
    return null;
  }
}

// Legacy functions for backward compatibility
export function createSession(user: AdminUser): string {
  return createToken(user);
}

export function getSession(sessionId: string): AdminUser | null {
  return verifyToken(sessionId);
}

export function deleteSession(_sessionId: string): void {
  // No-op for token-based auth (cookie deletion handles this)
}

// Client-side session helpers
export function getSessionFromCookie(): string | null {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const sessionCookie = cookies.find(c => c.trim().startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!sessionCookie) return null;
  return sessionCookie.split('=')[1];
}

export function setSessionCookie(sessionId: string): void {
  if (typeof window === 'undefined') return;
  const expires = new Date(Date.now() + SESSION_DURATION).toUTCString();
  document.cookie = `${SESSION_COOKIE_NAME}=${sessionId}; path=/; expires=${expires}; SameSite=Lax`;
}

export function clearSessionCookie(): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
