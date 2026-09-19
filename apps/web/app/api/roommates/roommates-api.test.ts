import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClient,
}));

import { GET as getProfiles, POST as saveProfile } from './profiles/route';
import { GET as getPosts, POST as createPost } from './posts/route';
import { GET as getBookmarks } from './bookmarks/route';

function request(path: string, method = 'GET', body?: unknown) {
  return new NextRequest(`http://localhost:3000${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

function queryBuilder(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {};
  for (const method of ['select', 'eq', 'order', 'limit', 'ilike', 'gte', 'lte', 'upsert', 'insert', 'delete']) {
    builder[method] = vi.fn(() => builder);
  }
  builder.single = vi.fn(async () => result);
  builder.then = (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve);
  return builder as {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    ilike: ReturnType<typeof vi.fn>;
    gte: ReturnType<typeof vi.fn>;
    lte: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
  };
}

describe('roommate marketplace API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns discoverable profiles using bounded public filters', async () => {
    const query = queryBuilder({ data: [{ id: 'profile-1' }], error: null });
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    const response = await getProfiles(
      request('/api/roommates/profiles?city=HCM&budget_min=2000000&limit=999'),
    );

    expect(response.status).toBe(200);
    expect(query.eq).toHaveBeenCalledWith('is_discoverable', true);
    expect(query.ilike).toHaveBeenCalledWith('city', '%HCM%');
    expect(query.gte).toHaveBeenCalledWith('budget_max', 2000000);
    expect(query.limit).toHaveBeenCalledWith(50);
  });

  it('does not apply zero-value budget filters when query params are absent', async () => {
    const query = queryBuilder({ data: [], error: null });
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    const response = await getProfiles(request('/api/roommates/profiles'));

    expect(response.status).toBe(200);
    expect(query.gte).not.toHaveBeenCalledWith('budget_max', 0);
    expect(query.lte).not.toHaveBeenCalledWith('budget_min', 0);
  });

  it('filters profiles by a bounded move-in window', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-18T08:00:00.000Z'));
    const query = queryBuilder({ data: [], error: null });
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    const response = await getProfiles(request('/api/roommates/profiles?move_in_days=30'));

    expect(response.status).toBe(200);
    expect(query.gte).toHaveBeenCalledWith('move_in_date', '2026-09-18');
    expect(query.lte).toHaveBeenCalledWith('move_in_date', '2026-10-18');
    vi.useRealTimers();
  });

  it('rejects profile writes without an authenticated user', async () => {
    mocks.createClient.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: null } })) },
    });

    const response = await saveProfile(request('/api/roommates/profiles', 'POST', {}));
    expect(response.status).toBe(401);
  });

  it('always assigns a profile to the verified session user', async () => {
    const query = queryBuilder({ data: { id: 'profile-1' }, error: null });
    mocks.createClient.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'verified-user' } } })) },
      from: vi.fn(() => query),
    });

    const response = await saveProfile(
      request('/api/roommates/profiles', 'POST', {
        user_id: 'attacker-user',
        display_name: 'Minh An',
        city: 'TP.HCM',
        district: 'Bình Thạnh',
        budget_min: 2500000,
        budget_max: 3500000,
        bio: 'Mình tôn trọng không gian chung.',
        is_discoverable: true,
      }),
    );

    expect(response.status).toBe(201);
    expect(query.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'verified-user' }),
      { onConflict: 'user_id' },
    );
    const upsertedProfile = query.upsert.mock.calls.at(0)?.at(0);
    expect(upsertedProfile).not.toMatchObject({ user_id: 'attacker-user' });
  });

  it('filters the public forum and derives the author from auth metadata', async () => {
    const listQuery = queryBuilder({ data: [], error: null });
    mocks.createClient.mockResolvedValueOnce({ from: vi.fn(() => listQuery) });
    const listResponse = await getPosts(request('/api/roommates/posts?search=HUTECH'));
    expect(listResponse.status).toBe(200);
    expect(listQuery.eq).toHaveBeenCalledWith('status', 'published');
    expect(listQuery.ilike).toHaveBeenCalledWith('title', '%HUTECH%');

    const insertQuery = queryBuilder({ data: { id: 'post-1' }, error: null });
    mocks.createClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: { id: 'verified-user', email: 'an@example.com', user_metadata: { full_name: 'Minh An' } } },
        })),
      },
      from: vi.fn(() => insertQuery),
    });
    const createResponse = await createPost(
      request('/api/roommates/posts', 'POST', {
        author_id: 'attacker-user',
        author_name: 'Giả mạo',
        title: 'Tìm bạn ở ghép Bình Thạnh',
        content: 'Mình cần một bạn ở ghép lâu dài, sạch sẽ và tôn trọng nhau.',
        city: 'TP.HCM',
        district: 'Bình Thạnh',
        budget_min: 2500000,
        budget_max: 3500000,
      }),
    );
    expect(createResponse.status).toBe(201);
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({ author_id: 'verified-user', author_name: 'Minh An' }),
    );
  });

  it('keeps bookmarks private to signed-in users', async () => {
    mocks.createClient.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: null } })) },
    });
    const response = await getBookmarks();
    expect(response.status).toBe(401);
  });
});
