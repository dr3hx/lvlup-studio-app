import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// Define locales here since we can't import from config in middleware
const locales = ['en', 'ar'];

export default async function middleware(request: NextRequest) {
  const defaultLocale = request.headers.get('dashcode-locale') || 'en';
  
  // Skip middleware for specific paths
  const PUBLIC_PATHS = [
    '/api/auth',
    '/_next',
    '/images',
    '/favicon.ico'
  ];

  if (PUBLIC_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Create and call the next-intl middleware
  const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always'
  });

  const response = handleI18nRouting(request);
  response.headers.set('dashcode-locale', defaultLocale);
  return response;
}

export const config = {
  // Match all pathnames except for
  // - /api/auth (NextAuth paths)
  // - /_next (Next.js internals)
  // - /images (inside /public)
  // - /favicon.ico (inside /public)
  matcher: ['/((?!api|_next|images|favicon.ico).*)']
};
