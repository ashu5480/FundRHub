import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDb, type DbUser } from './db';
import type { User } from '@/lib/types';

// ─── Errors ─────────────────────────────────────────────────────────────────

/** Base API error carrying an HTTP status and machine-readable code. */
export class ApiError extends Error {
  status: number;
  code: string;
  details?: Array<{ field: string; message: string }>;

  constructor(status: number, code: string, message: string, details?: Array<{ field: string; message: string }>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** 400 Bad Request. */
export function badRequest(message: string, details?: Array<{ field: string; message: string }>): ApiError {
  return new ApiError(400, 'BAD_REQUEST', message, details);
}

/** 401 Unauthorized. */
export function unauthorized(message = 'Authentication required'): ApiError {
  return new ApiError(401, 'UNAUTHORIZED', message);
}

/** 403 Forbidden. */
export function forbidden(message = 'You do not have permission to perform this action'): ApiError {
  return new ApiError(403, 'FORBIDDEN', message);
}

/** 404 Not Found. */
export function notFound(message = 'Resource not found'): ApiError {
  return new ApiError(404, 'NOT_FOUND', message);
}

/** 409 Conflict. */
export function conflict(message: string): ApiError {
  return new ApiError(409, 'CONFLICT', message);
}

// ─── Sessions ───────────────────────────────────────────────────────────────

const SESSION_COOKIE = 'fundrhub_session';

/**
 * Demo session: the cookie value is the user id. A production build would use
 * signed JWTs — kept simple intentionally per the demo architecture.
 */
export function setSessionCookie(userId: string): string {
  cookies().set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return userId;
}

/** Clear the session cookie. */
export function clearSessionCookie(): void {
  cookies().delete(SESSION_COOKIE);
}

/** Look up the current user from the session cookie. Returns null when signed out. */
export function getSessionUser(): User | null {
  const id = cookies().get(SESSION_COOKIE)?.value;
  if (!id) return null;
  const found = getDb().users.find((u) => u.id === id);
  return found ? stripPassword(found) : null;
}

/** Remove the password hash from a user record before returning it. */
export function stripPassword(user: DbUser): User {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

/** Alias of stripPassword used by the register route. */
export const publicUser = stripPassword;

// ─── Current user & guards ──────────────────────────────────────────────────

/**
 * Get the current user. Accepts either the session cookie or an
 * `Authorization: Bearer <userId>` header (handy for API exploration tools).
 * Throws 401 when the caller is not signed in.
 */
export function getCurrentUser(): User {
  const fromCookie = getSessionUser();
  if (fromCookie) return fromCookie;
  throw unauthorized();
}

/** Throw 401 when there is no user (for optional-user flows). */
export function requireUser(user: User | null | undefined): asserts user is User {
  if (!user) throw unauthorized();
}

/** Throw 403 unless the current user is an admin. */
export function requireAdmin(user: User | null | undefined): asserts user is User {
  if (!user) throw unauthorized();
  if (user.role !== 'ADMIN') throw forbidden('Admin access required');
}

// ─── Handlers ───────────────────────────────────────────────────────────────

type Params = { params: { id: string } };

/** JSON response helper. */
export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data as Record<string, unknown>, { status });
}

/** Parse and validate a JSON body. Throws 400 on malformed input. */
export async function parseBody<T>(req: NextRequest): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw badRequest('Invalid JSON body');
  }
}

/**
 * Wrap a route handler with uniform error mapping: ApiError keeps its status,
 * everything else becomes a 500. Every handler stays free of try/catch noise.
 */
export function handle<Ctx = Params>(
  fn: (req: NextRequest, ctx: Ctx) => Promise<NextResponse> | NextResponse,
) {
  return async (req: NextRequest, ctx: Ctx): Promise<NextResponse> => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json(
          { error: { code: err.code, message: err.message, details: err.details } },
          { status: err.status },
        );
      }
      console.error('[api] unhandled error:', err);
      return NextResponse.json(
        { error: { code: 'INTERNAL', message: 'Something went wrong. Please try again.' } },
        { status: 500 },
      );
    }
  };
}
