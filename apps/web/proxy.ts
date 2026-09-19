import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export const PROTECTED_DASHBOARD_ROUTES = [
  '/dashboard/profile',
  '/dashboard/settings',
  '/admin',
] as const;

export function isProtectedDashboardRoute(pathname: string) {
  return PROTECTED_DASHBOARD_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = isProtectedDashboardRoute(pathname);

  // Public Dashboard tools remain available without Supabase configuration.
  // Sensitive routes fail closed, including local environments.
  const isDevMode =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (isDevMode) {
    return isProtectedRoute ? redirectToLogin(request) : supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedRoute && !user) {
    return redirectToLogin(request);
  }

  // Redirect to dashboard if already logged in and accessing auth pages
  const authRoutes = ['/login', '/register'];
  if (user && authRoutes.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
