import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  requireAdminAccess: vi.fn(),
  createAdminClient: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('@/lib/auth/roles', () => ({ requireAdminAccess: mocks.requireAdminAccess }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock('next/cache', () => ({ revalidateTag: mocks.revalidateTag }));

import { DELETE, GET, PATCH } from './route';

const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const POST_ID = '22222222-2222-4222-8222-222222222222';

function patchRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/blog', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function deleteRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/blog', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function listChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  chain.limit = vi.fn(async () => result);
  return chain as {
    select: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
  };
}

function existingChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.maybeSingle = vi.fn(async () => result);
  return chain as {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
  };
}

function updateChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.update = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.select = vi.fn(() => chain);
  chain.single = vi.fn(async () => result);
  return chain as {
    update: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
  };
}

function deleteChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.delete = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.select = vi.fn(() => chain);
  chain.maybeSingle = vi.fn(async () => result);
  return chain as {
    delete: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
  };
}

describe('admin blog editorial API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('denies a normal user before creating a service-role client', async () => {
    mocks.requireAdminAccess.mockResolvedValue({
      userId: POST_ID,
      role: 'user',
      authenticated: true,
      authorized: false,
    });

    const response = await GET();
    expect(response.status).toBe(403);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it('returns the editorial queue to an admin', async () => {
    mocks.requireAdminAccess.mockResolvedValue({
      userId: ADMIN_ID,
      role: 'admin',
      authenticated: true,
      authorized: true,
    });
    const query = listChain({ data: [{ id: POST_ID, status: 'pending' }], error: null });
    mocks.createAdminClient.mockReturnValue({ from: vi.fn(() => query) });

    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.posts).toEqual([{ id: POST_ID, status: 'pending' }]);
    expect(query.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(query.limit).toHaveBeenCalledWith(200);
  });

  it('records the approving admin and publication time', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-18T16:00:00.000Z'));
    mocks.requireAdminAccess.mockResolvedValue({
      userId: ADMIN_ID,
      role: 'admin',
      authenticated: true,
      authorized: true,
    });
    const current = existingChain({ data: { status: 'pending', published_at: null }, error: null });
    const mutation = updateChain({ data: { id: POST_ID, status: 'published' }, error: null });
    const from = vi.fn().mockReturnValueOnce(current).mockReturnValueOnce(mutation);
    mocks.createAdminClient.mockReturnValue({ from });

    const response = await PATCH(patchRequest({
      id: POST_ID,
      slug: 'Bi Quyet O Ghep',
      status: 'published',
    }));

    expect(response.status).toBe(200);
    expect(mutation.update).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'bi-quyet-o-ghep',
      status: 'published',
      approved_by: ADMIN_ID,
      published_at: '2026-09-18T16:00:00.000Z',
    }));
    expect(mocks.revalidateTag).toHaveBeenCalledWith('blog', 'max');
    vi.useRealTimers();
  });

  it('returns a conflict when an admin chooses a duplicate slug', async () => {
    mocks.requireAdminAccess.mockResolvedValue({
      userId: ADMIN_ID,
      role: 'admin',
      authenticated: true,
      authorized: true,
    });
    const current = existingChain({ data: { status: 'draft', published_at: null }, error: null });
    const mutation = updateChain({ data: null, error: { code: '23505', message: 'duplicate' } });
    mocks.createAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValueOnce(current).mockReturnValueOnce(mutation),
    });

    const response = await PATCH(patchRequest({ id: POST_ID, slug: 'slug-trung' }));
    expect(response.status).toBe(409);
  });

  it('does not allow a normal user to delete a blog post', async () => {
    mocks.requireAdminAccess.mockResolvedValue({
      userId: POST_ID,
      role: 'user',
      authenticated: true,
      authorized: false,
    });

    const response = await DELETE(deleteRequest({ id: POST_ID }));
    expect(response.status).toBe(403);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it('lets an admin delete a blog post and invalidates public blog caches', async () => {
    mocks.requireAdminAccess.mockResolvedValue({
      userId: ADMIN_ID,
      role: 'admin',
      authenticated: true,
      authorized: true,
    });
    const mutation = deleteChain({ data: { id: POST_ID }, error: null });
    mocks.createAdminClient.mockReturnValue({ from: vi.fn(() => mutation) });

    const response = await DELETE(deleteRequest({ id: POST_ID }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.deletedId).toBe(POST_ID);
    expect(mutation.delete).toHaveBeenCalledOnce();
    expect(mutation.eq).toHaveBeenCalledWith('id', POST_ID);
    expect(mocks.revalidateTag).toHaveBeenCalledWith('blog', 'max');
  });
});
