import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getCurrentUserAccess: vi.fn() }));
vi.mock('@/lib/auth/roles', () => ({ getCurrentUserAccess: mocks.getCurrentUserAccess }));

import { GET } from './route';

describe('current role API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not expose a role without authentication', async () => {
    mocks.getCurrentUserAccess.mockResolvedValue({ userId: null, role: 'user' });
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it('returns the server-verified role for an authenticated user', async () => {
    mocks.getCurrentUserAccess.mockResolvedValue({ userId: 'user-id', role: 'admin' });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ role: 'admin' });
  });
});
