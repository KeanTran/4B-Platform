import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }));

import { GET, POST } from './route';

function postRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/blog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function listChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.order = vi.fn(async () => result);
  return chain as {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
  };
}

function insertChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.insert = vi.fn(() => chain);
  chain.select = vi.fn(() => chain);
  chain.single = vi.fn(async () => result);
  return chain as {
    insert: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
  };
}

describe('community blog API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns only published posts ordered by publication time', async () => {
    const query = listChain({ data: [{ id: 'post-1', status: 'published' }], error: null });
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    const response = await GET();
    expect(response.status).toBe(200);
    expect(query.eq).toHaveBeenCalledWith('status', 'published');
    expect(query.order).toHaveBeenCalledWith('published_at', { ascending: false });
  });

  it('requires authentication before accepting a submission', async () => {
    mocks.createClient.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: null } })) },
    });

    const response = await POST(postRequest({}));
    expect(response.status).toBe(401);
  });

  it('binds a pending submission to the verified user', async () => {
    const query = insertChain({
      data: { id: 'post-1', slug: 'bi-quyet-o-ghep-12345678', status: 'pending' },
      error: null,
    });
    mocks.createClient.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'verified-user' } } })) },
      from: vi.fn(() => query),
    });

    const response = await POST(postRequest({
      title: 'Bí quyết ở ghép vui vẻ',
      content: 'Tôn trọng không gian chung và thống nhất mọi khoản chi phí từ đầu.',
      excerpt: '',
      author_name: 'Minh An',
      category: 'Kinh nghiệm',
      created_by: 'attacker-user',
      status: 'published',
    }));

    expect(response.status).toBe(400);
    expect(query.insert).not.toHaveBeenCalled();
  });

  it('creates a pending post without trusting publication fields from the client', async () => {
    const query = insertChain({
      data: { id: 'post-1', slug: 'bi-quyet-o-ghep-12345678', status: 'pending' },
      error: null,
    });
    mocks.createClient.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'verified-user' } } })) },
      from: vi.fn(() => query),
    });

    const response = await POST(postRequest({
      title: 'Bí quyết ở ghép vui vẻ',
      content: 'Tôn trọng không gian chung và thống nhất mọi khoản chi phí từ đầu.',
      excerpt: '',
      author_name: 'Minh An',
      category: 'Kinh nghiệm',
    }));

    expect(response.status).toBe(201);
    expect(query.insert).toHaveBeenCalledWith(expect.objectContaining({
      created_by: 'verified-user',
      status: 'pending',
      slug: expect.stringMatching(/^bi-quyet-o-ghep-vui-ve-[a-f0-9]{8}$/),
    }));
  });
});
