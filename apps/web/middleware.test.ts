// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { isProtectedDashboardRoute, middleware } from './middleware';

describe('Dashboard route boundaries', () => {
  it.each([
    '/dashboard',
    '/dashboard/split',
    '/dashboard/duties',
    '/dashboard/ai',
  ])('keeps the core tool public: %s', (pathname) => {
    expect(isProtectedDashboardRoute(pathname)).toBe(false);
  });

  it.each([
    '/dashboard/profile',
    '/dashboard/profile/security',
    '/dashboard/settings',
    '/dashboard/settings/billing',
  ])('protects personal or sensitive routes: %s', (pathname) => {
    expect(isProtectedDashboardRoute(pathname)).toBe(true);
  });

  it('serves the public Dashboard when Supabase is not configured', async () => {
    const response = await middleware(
      new NextRequest('http://localhost:3000/dashboard/split'),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('fails closed for sensitive routes when Supabase is not configured', async () => {
    const response = await middleware(
      new NextRequest('http://localhost:3000/dashboard/settings'),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/login?next=%2Fdashboard%2Fsettings',
    );
  });
});
