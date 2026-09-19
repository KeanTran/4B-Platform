import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  requireAdminAccess: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock('@/lib/auth/roles', () => ({ requireAdminAccess: mocks.requireAdminAccess }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: mocks.createAdminClient }));

import { GET, PATCH } from './route';

const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const USER_ID = '22222222-2222-4222-8222-222222222222';

function patchRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function mutationChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  for (const method of ['upsert', 'select']) chain[method] = vi.fn(() => chain);
  chain.single = vi.fn(async () => result);
  return chain as {
    upsert: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
  };
}

describe('admin user roles API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('denies a normal user before creating an admin client', async () => {
    mocks.requireAdminAccess.mockResolvedValue({
      userId: USER_ID,
      role: 'user',
      authenticated: true,
      authorized: false,
    });

    const response = await GET();
    expect(response.status).toBe(403);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it('returns a sanitized user list to admins', async () => {
    mocks.requireAdminAccess.mockResolvedValue({
      userId: ADMIN_ID,
      role: 'admin',
      authenticated: true,
      authorized: true,
    });
    mocks.createAdminClient.mockReturnValue({
      auth: {
        admin: {
          listUsers: vi.fn(async () => ({
            data: {
              users: [
                { id: ADMIN_ID, email: 'admin@example.com', created_at: '2026-09-18T00:00:00Z', user_metadata: { full_name: 'Admin 4B' } },
                { id: USER_ID, email: 'user@example.com', created_at: '2026-09-18T00:00:00Z', user_metadata: {} },
              ],
            },
            error: null,
          })),
        },
      },
      from: vi.fn(() => ({
        select: vi.fn(async () => ({ data: [{ user_id: ADMIN_ID, role: 'admin' }], error: null })),
      })),
    });

    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.users).toEqual([
      expect.objectContaining({ id: ADMIN_ID, email: 'admin@example.com', role: 'admin' }),
      expect.objectContaining({ id: USER_ID, email: 'user@example.com', role: 'user' }),
    ]);
    expect(JSON.stringify(body)).not.toContain('user_metadata');
  });

  it('prevents an admin from demoting the active account', async () => {
    mocks.requireAdminAccess.mockResolvedValue({
      userId: ADMIN_ID,
      role: 'admin',
      authenticated: true,
      authorized: true,
    });

    const response = await PATCH(patchRequest({ user_id: ADMIN_ID, role: 'user' }));
    expect(response.status).toBe(409);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it('records the assigning admin when changing another user role', async () => {
    mocks.requireAdminAccess.mockResolvedValue({
      userId: ADMIN_ID,
      role: 'admin',
      authenticated: true,
      authorized: true,
    });
    const chain = mutationChain({
      data: { user_id: USER_ID, role: 'admin', updated_at: '2026-09-18T01:00:00Z' },
      error: null,
    });
    mocks.createAdminClient.mockReturnValue({ from: vi.fn(() => chain) });

    const response = await PATCH(patchRequest({ user_id: USER_ID, role: 'admin' }));
    expect(response.status).toBe(200);
    expect(chain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: USER_ID, role: 'admin', assigned_by: ADMIN_ID }),
      { onConflict: 'user_id' },
    );
  });
});
