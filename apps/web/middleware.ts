import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'fundrhub_session';

const PUBLIC_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/startups',
  '/investors',
  '/contact',
  '/coming-soon',
  '/about',
  '/how-it-works',
  '/terms',
  '/privacy',
  '/disclaimer',
];

function isPublic(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};