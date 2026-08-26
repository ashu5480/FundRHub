import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb, saveDb, uid, nowIso, DbUser, Session } from './db';
import type { User as PublicUser } from '@/lib/types';

export const SESSION_COOKIE = 'fundrhub_session';
const SESSION_TTL_S = 7 * 24 * 60 * 60; // 7 days

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const badRequest = (message: string, details?: unknown) => new HttpError(400, 'VALIDATION_ERROR', message, details);
export const unauthorized = (message = 'Authentication required') => new HttpError(401, 'UNAUTHORIZED', message);
export const forbidden = (message = 'Not authorized') => new HttpError(403, 'FORBIDDEN', message);
export const notFound = (message = 'Resource not found') => new HttpError(404, 'NOT_FOUND', message);
export const conflict = (message: string) => new HttpError(409, 'CONFLICT', message);

/** Error-envelope response helper (matches docs/architecture/api-design.md). */
export function errorResponse(err: unknown): NextResponse {
  if (err instanceof HttpError) {
    const body: Record<string, unknown> = {
      error: { code: err.code, message: err.message },
    };
    if (err.details !== undefined) {
      (body.error as { details?: unknown }).details = err.details;
    }
    return NextResponse.json(body, { status: err.status });
  }
  console.error('[api] unexpected error', err);
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error' } },
    { status: 500 },
  );
}

/** Wrap a route handler with standard error handling. */
export function handle(
  fn: (req: Request, ctx: { params: Record<string, string> }) => Promise<NextResponse>,
) {
  return async (req: Request, ctx: { params: Record<string, string> }) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export async function parseBody<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw badRequest('Invalid JSON body');
  }
}

export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/** Strip the password hash when returning a user to the client. */
export function publicUser(user: DbUser): PublicUser {
  const { passwordHash: _drop, ...rest } = user;
  return rest;
}

/** Create a session and set the cookie. */
export function setSessionCookie(userId: string): string {
  const token = uid();
  const session: Session = {
    token,
    userId,
    createdAt: nowIso(),
    expiresAt: new Date(Date.now() + SESSION_TTL_S * 1000).toISOString(),
  };
  const db = getDb();
  db.sessions.push(session);
  saveDb(db);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_S,
  });
  return token;
}

export function clearSessionCookie(): void {
  const db = getDb();
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    db.sessions = db.sessions.filter((s) => s.token !== token);
    saveDb(db);
  }
  cookies().set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

/** Resolve the current authenticated user; throws 401 if absent. */
export function getCurrentUser(): DbUser {
  const db = getDb();
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token ? db.sessions.find((s) => s.token === token && s.expiresAt > nowIso()) : undefined;
  const user = session ? db.users.find((u) => u.id === session.userId) : undefined;
  if (!user) throw unauthorized('Please log in to continue');
  return user;
}

export function requireUser(user: DbUser): void {
  if (user.status === 'SUSPENDED') {
    throw forbidden('Account suspended');
  }
}

export function requireAdmin(user: DbUser): void {
  if (user.role !== 'ADMIN') throw forbidden('Admin access required');
}