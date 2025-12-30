import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  isAuthenticatedNextjs,
  nextjsMiddlewareRedirect,
} from '@convex-dev/auth/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const isSignInPage = createRouteMatcher(['/auth']);

export default convexAuthNextjsMiddleware((req) => {
  const host = req.headers.get('host') ?? '';
  const url = req.nextUrl;

  // ---- account.kiiaren.com ----
  if (host === 'account.kiiaren.com') {
    if (!url.pathname.startsWith('/account')) {
      url.pathname = `/account${url.pathname}`;
    }
    // Protect account routes
    if (!isSignInPage(req) && !isAuthenticatedNextjs()) {
      return nextjsMiddlewareRedirect(req, '/auth');
    }
    return NextResponse.rewrite(url);
  }

  // ---- dashboard.kiiaren.com ----
  if (host === 'dashboard.kiiaren.com') {
    if (!url.pathname.startsWith('/app')) {
      url.pathname = `/app${url.pathname}`;
    }
    // Protect dashboard
    if (!isSignInPage(req) && !isAuthenticatedNextjs()) {
      return nextjsMiddlewareRedirect(req, '/auth');
    }
    return NextResponse.rewrite(url);
  }

  // ---- api.kiiaren.com ----
  if (host === 'api.kiiaren.com') {
    if (!url.pathname.startsWith('/api')) {
      url.pathname = `/api${url.pathname}`;
    }
    return NextResponse.rewrite(url);
  }

  // ---- www.kiiaren.com → kiiaren.com ----
  if (host === 'www.kiiaren.com') {
    url.hostname = 'kiiaren.com';
    return NextResponse.redirect(url);
  }

  // ---- kiiaren.com (marketing) ----
  if (host === 'kiiaren.com') {
    // Marketing is public, no auth redirect forced
    return NextResponse.next();
  }

  // ---- Localhost / Fallback ----
  // For development (localhost:3000), behave like dashboard by default (existing behavior)
  // or respect existing auth rules
  if (!isSignInPage(req) && !isAuthenticatedNextjs()) {
    return nextjsMiddlewareRedirect(req, '/auth');
  }

  if (isSignInPage(req) && isAuthenticatedNextjs()) {
    return nextjsMiddlewareRedirect(req, '/');
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|favicon.ico|assets).*)'],
};
