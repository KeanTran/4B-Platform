import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  createClient: vi.fn(),
  isSupabaseServerConfigured: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClient,
  isSupabaseServerConfigured: mocks.isSupabaseServerConfigured,
}));

import { POST } from './route';

function request(body: unknown) {
  return new NextRequest('http://localhost:3000/api/support/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
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

describe('public support message API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSupabaseServerConfigured.mockReturnValue(true);
    mocks.createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });
  });

  it('validates contact details before creating a service-role client', async () => {
    const response = await POST(request({ email: 'sai', message: 'ngắn' }));
    expect(response.status).toBe(400);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it('silently discards honeypot submissions', async () => {
    const response = await POST(request({
      email: 'bot@example.com',
      message: 'Nội dung đủ dài từ bot',
      website: 'https://spam.example',
    }));
    expect(response.status).toBe(201);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it('stores an anonymous request in the admin inbox', async () => {
    const query = insertChain({
      data: { id: '11111111-1111-4111-8111-111111111111', created_at: '2026-09-18T00:00:00.000Z' },
      error: null,
    });
    mocks.createAdminClient.mockReturnValue({ from: vi.fn(() => query) });

    const response = await POST(request({
      email: 'User@Example.com',
      phone: '0901234567',
      message: 'Tôi cần hỗ trợ về cách chia tiền phòng.',
      source_path: '/pricing',
    }));

    expect(response.status).toBe(201);
    expect(query.insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: null,
      email: 'user@example.com',
      status: 'new',
      source_path: '/pricing',
    }));
  });
});
