import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: mocks.createAdminClient }));

import { GET, PATCH, POST } from './route';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_ID = '22222222-2222-4222-8222-222222222222';
const PROFILE_ID = '33333333-3333-4333-8333-333333333333';
const CONNECTION_ID = '44444444-4444-4444-8444-444444444444';

function request(method: string, body?: unknown) {
  return new NextRequest('http://localhost:3000/api/roommates/connections', {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

function chain(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {};
  for (const method of ['select', 'or', 'order', 'in', 'eq', 'update', 'insert']) {
    builder[method] = vi.fn(() => builder);
  }
  builder.maybeSingle = vi.fn(async () => result);
  builder.single = vi.fn(async () => result);
  builder.then = (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve);
  return builder as {
    select: ReturnType<typeof vi.fn>;
    or: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    in: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
  };
}

function authenticated(userId = USER_ID) {
  mocks.createClient.mockResolvedValue({
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: userId } } })) },
  });
}

const profile = {
  id: PROFILE_ID,
  user_id: OTHER_ID,
  display_name: 'Minh An',
  birth_year: 2003,
  occupation: 'Sinh viên',
  city: 'TP.HCM',
  district: 'Bình Thạnh',
  budget_min: 2500000,
  budget_max: 3500000,
  move_in_date: null,
  bio: 'Tôn trọng không gian chung.',
  habits: ['Không hút thuốc'],
  gender: 'prefer_not_to_say',
  preferred_gender: 'any',
  smoking: false,
  has_pets: false,
  avatar_url: null,
  is_discoverable: true,
  created_at: '2026-09-18T00:00:00.000Z',
  updated_at: '2026-09-18T00:00:00.000Z',
};

const connection = {
  id: CONNECTION_ID,
  requester_user_id: USER_ID,
  recipient_user_id: OTHER_ID,
  message: 'Mình thấy hai đứa khá hợp.',
  status: 'pending',
  created_at: '2026-09-18T00:00:00.000Z',
  updated_at: '2026-09-18T00:00:00.000Z',
};

describe('roommate connections API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires authentication before reading connection history', async () => {
    mocks.createClient.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: null } })) },
    });
    const response = await GET();
    expect(response.status).toBe(401);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it('returns only a public counterpart profile without auth user ids', async () => {
    authenticated();
    const connectionsQuery = chain({ data: [connection], error: null });
    const profilesQuery = chain({ data: [profile], error: null });
    const from = vi.fn().mockReturnValueOnce(connectionsQuery).mockReturnValueOnce(profilesQuery);
    mocks.createAdminClient.mockReturnValue({ from });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(connectionsQuery.or).toHaveBeenCalledWith(
      `requester_user_id.eq.${USER_ID},recipient_user_id.eq.${USER_ID}`,
    );
    expect(body.connections[0]).toMatchObject({
      id: CONNECTION_ID,
      direction: 'outgoing',
      status: 'pending',
      profile: { id: PROFILE_ID, display_name: 'Minh An' },
    });
    expect(JSON.stringify(body)).not.toContain('requester_user_id');
    expect(JSON.stringify(body)).not.toContain('recipient_user_id');
    expect(body.connections[0].profile).not.toHaveProperty('user_id');
  });

  it('creates an outgoing request with the verified user as requester', async () => {
    authenticated();
    const targetQuery = chain({ data: profile, error: null });
    const ownProfileQuery = chain({ data: { id: 'own-profile' }, error: null });
    const existingQuery = chain({ data: null, error: null });
    const insertQuery = chain({ data: connection, error: null });
    const from = vi.fn()
      .mockReturnValueOnce(targetQuery)
      .mockReturnValueOnce(ownProfileQuery)
      .mockReturnValueOnce(existingQuery)
      .mockReturnValueOnce(insertQuery);
    mocks.createAdminClient.mockReturnValue({ from });

    const response = await POST(request('POST', { profile_id: PROFILE_ID, message: 'Xin chào!' }));

    expect(response.status).toBe(201);
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({ requester_user_id: USER_ID, recipient_user_id: OTHER_ID }),
    );
  });

  it('allows only the recipient to accept a pending request', async () => {
    authenticated(OTHER_ID);
    const readQuery = chain({ data: connection, error: null });
    const updated = { id: CONNECTION_ID, status: 'accepted', updated_at: '2026-09-18T01:00:00.000Z' };
    const updateQuery = chain({ data: updated, error: null });
    mocks.createAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValueOnce(readQuery).mockReturnValueOnce(updateQuery),
    });

    const response = await PATCH(request('PATCH', { connection_id: CONNECTION_ID, action: 'accept' }));
    expect(response.status).toBe(200);
    expect(updateQuery.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'accepted' }));
  });

  it('prevents the requester from accepting their own invitation', async () => {
    authenticated(USER_ID);
    const readQuery = chain({ data: connection, error: null });
    mocks.createAdminClient.mockReturnValue({ from: vi.fn(() => readQuery) });

    const response = await PATCH(request('PATCH', { connection_id: CONNECTION_ID, action: 'accept' }));
    expect(response.status).toBe(403);
    expect(readQuery.update).not.toHaveBeenCalled();
  });
});
