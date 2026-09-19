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
const MESSAGE_ID = '22222222-2222-4222-8222-222222222222';

function patchRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/support', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function listChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  chain.limit = vi.fn(async () => result);
  return chain as { select: ReturnType<typeof vi.fn>; order: ReturnType<typeof vi.fn>; limit: ReturnType<typeof vi.fn> };
}

function updateChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.update = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.select = vi.fn(() => chain);
  chain.single = vi.fn(async () => result);
  return chain as { update: ReturnType<typeof vi.fn>; eq: ReturnType<typeof vi.fn>; select: ReturnType<typeof vi.fn>; single: ReturnType<typeof vi.fn> };
}

describe('admin support inbox API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('denies a normal user before creating a service-role client', async () => {
    mocks.requireAdminAccess.mockResolvedValue({ userId: MESSAGE_ID, role: 'user', authenticated: true, authorized: false });
    const response = await GET();
    expect(response.status).toBe(403);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it('returns support requests to an admin', async () => {
    mocks.requireAdminAccess.mockResolvedValue({ userId: ADMIN_ID, role: 'admin', authenticated: true, authorized: true });
    const query = listChain({ data: [{ id: MESSAGE_ID, status: 'new' }], error: null });
    mocks.createAdminClient.mockReturnValue({ from: vi.fn(() => query) });
    const response = await GET();
    expect(response.status).toBe(200);
    expect((await response.json()).messages).toEqual([{ id: MESSAGE_ID, status: 'new' }]);
    expect(query.limit).toHaveBeenCalledWith(250);
  });

  it('records which admin is handling a request', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-18T16:30:00.000Z'));
    mocks.requireAdminAccess.mockResolvedValue({ userId: ADMIN_ID, role: 'admin', authenticated: true, authorized: true });
    const query = updateChain({ data: { id: MESSAGE_ID, status: 'in_progress' }, error: null });
    mocks.createAdminClient.mockReturnValue({ from: vi.fn(() => query) });
    const response = await PATCH(patchRequest({ id: MESSAGE_ID, status: 'in_progress', admin_note: 'Đã gửi email.' }));
    expect(response.status).toBe(200);
    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({
      handled_by: ADMIN_ID,
      handled_at: '2026-09-18T16:30:00.000Z',
      admin_note: 'Đã gửi email.',
    }));
    vi.useRealTimers();
  });
});
