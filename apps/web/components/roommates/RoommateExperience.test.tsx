import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoommateExperience } from './RoommateExperience';

describe('RoommateExperience', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lets people browse suggested roommate profiles', async () => {
    render(<RoommateExperience />);
    await screen.findByText('Dữ liệu mẫu');

    expect(screen.getByRole('heading', { name: 'Tìm Bạn Ở Ghép' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nguyễn Minh An, 21' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Hồ sơ tiếp theo' }));

    expect(screen.getByRole('heading', { name: 'Trần Ngọc Linh, 22' })).toBeInTheDocument();
  });

  it('switches from discovery to the roommate forum', async () => {
    render(<RoommateExperience />);
    await screen.findByText('Dữ liệu mẫu');

    fireEvent.click(screen.getByRole('button', { name: 'Diễn đàn' }));

    expect(screen.getByRole('heading', { name: 'Diễn đàn Tìm Bạn Ở Ghép' })).toBeInTheDocument();
    expect(screen.getByText('Tìm 1 bạn nữ ở ghép gần Đại học HUTECH')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng bài tìm bạn/i })).toBeInTheDocument();
  });

  it('sends a real connection request for a live profile', async () => {
    const liveProfile = {
      id: '33333333-3333-4333-8333-333333333333',
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
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/profiles')) return { ok: true, json: async () => ({ profiles: [liveProfile] }) };
      if (url.includes('/posts')) return { ok: true, json: async () => ({ posts: [] }) };
      if (url.includes('/bookmarks')) return { ok: false, status: 401, json: async () => ({}) };
      if (url.includes('/connections') && init?.method === 'POST') {
        return {
          ok: true,
          status: 201,
          json: async () => ({
            connection: {
              id: '44444444-4444-4444-8444-444444444444',
              direction: 'outgoing',
              status: 'pending',
              message: '',
              profile: liveProfile,
              created_at: '2026-09-18T01:00:00.000Z',
              updated_at: '2026-09-18T01:00:00.000Z',
            },
          }),
        };
      }
      return { ok: true, json: async () => ({ connections: [] }) };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<RoommateExperience />);
    await screen.findByText('Dữ liệu cộng đồng');
    fireEvent.click(screen.getByRole('button', { name: 'Gửi lời mời kết nối' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/roommates/connections',
        expect.objectContaining({ method: 'POST' }),
      );
    });
    expect(await screen.findAllByText('Đang chờ phản hồi')).not.toHaveLength(0);
  });

  it('queries the API when roommate filters change', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/profiles')) return { ok: true, json: async () => ({ profiles: [] }) };
      if (url.includes('/posts')) return { ok: true, json: async () => ({ posts: [] }) };
      if (url.includes('/bookmarks')) return { ok: false, status: 401, json: async () => ({}) };
      return { ok: true, json: async () => ({ connections: [] }) };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<RoommateExperience />);
    await screen.findByText('Dữ liệu cộng đồng');
    fireEvent.change(screen.getByLabelText('Lọc theo khu vực'), { target: { value: 'Hà Nội' } });
    fireEvent.change(screen.getByLabelText('Lọc theo ngân sách'), { target: { value: '3000000-5000000' } });
    fireEvent.change(screen.getByLabelText('Lọc theo thời gian chuyển vào'), { target: { value: '30' } });

    await waitFor(() => {
      const profileUrls = fetchMock.mock.calls.map(([input]) => String(input));
      expect(profileUrls.some((url) =>
        url.includes('city=H%C3%A0+N%E1%BB%99i') &&
        url.includes('budget_min=3000000') &&
        url.includes('budget_max=5000000') &&
        url.includes('move_in_days=30'),
      )).toBe(true);
    });
  });
});
