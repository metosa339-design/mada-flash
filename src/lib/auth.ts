// Secure authentication system for admin
// Uses bcrypt for password hashing and environment variables for secrets

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'editor';
}

// Get credentials from environment variables (with fallbacks for development)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$12$xEyfoOO/GhC19J/lARQdNew8obKNE233z8pVboXy2LlC1uNTSef5K'; // MadaFlash2024!
const EDITOR_USERNAME = process.env.EDITOR_USERNAME || 'editor';
const EDITOR_PASSWORD_HASH = process.env.EDITOR_PASSWORD_HASH || '$2b$12$bk8osLi4QbGOh/ltHkrYTeaQebfcaSKgPHLTNukwAP2tXyRkXJj.e'; // Editor2024!

const SESSION_COOKIE_NAME = 'mada-flash-admin-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Secret key for signing tokens (use environment variable in production)
const SECRET_KEY = process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex');

// Token-based authentication
interface TokenPayload {
  user: AdminUser;
  exp: number;
  sig: string;
}

// Secure HMAC signature
function createSignature(user: AdminUser, exp: number): string {
  const data = `${user.id}:${user.username}:${user.role}:${exp}`;
  return crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
}

// Validate credentials using bcrypt (async)
export async function validateCredentials(username: string, password: string): Promise<AdminUser | null> {
  // Check admin credentials
  if (username === ADMIN_USERNAME) {
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (isValid) {
      return { id: '1', username: ADMIN_USERNAME, role: 'admin' };
    }
  }

  // Check editor credentials
  if (username === EDITOR_USERNAME) {
    const isValid = await bcrypt.compare(password, EDITOR_PASSWORD_HASH);
    if (isValid) {
      return { id: '2', username: EDITOR_USERNAME, role: 'editor' };
    }
  }

  return null;
}

// Create a secure token containing user data
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

    // Verify signature using constant-time comparison
    const expectedSig = createSignature(payload.user, payload.exp);
    if (!crypto.timingSafeEqual(Buffer.from(payload.sig), Buffer.from(expectedSig))) {
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

// Helper to generate password hash (for setup)
export async function generatePasswordHash(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
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
