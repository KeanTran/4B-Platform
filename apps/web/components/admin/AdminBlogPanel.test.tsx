import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { AdminBlogPanel } from './AdminBlogPanel';

const pendingPost = {
  id: '22222222-2222-4222-8222-222222222222',
  title: 'Bí quyết ở ghép vui vẻ',
  slug: 'bi-quyet-o-ghep-vui-ve-12345678',
  content: 'Tôn trọng không gian chung và thống nhất mọi khoản chi phí từ đầu.',
  excerpt: 'Một vài nguyên tắc sống chung.',
  author_name: 'Minh An',
  category: 'Kinh nghiệm',
  cover_image_url: null,
  cover_image_alt: null,
  likes_count: 0,
  views_count: 0,
  status: 'pending',
  seo_title: null,
  meta_description: null,
  published_at: null,
  created_at: '2026-09-18T00:00:00.000Z',
  updated_at: '2026-09-18T00:00:00.000Z',
  created_by: '33333333-3333-4333-8333-333333333333',
  approved_by: null,
} as const;

describe('AdminBlogPanel', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: [pendingPost] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ post: { ...pendingPost, status: 'published' } }),
      }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads the review queue and publishes through the admin API', async () => {
    render(<AdminBlogPanel />);

    expect(await screen.findAllByText('Bí quyết ở ghép vui vẻ')).not.toHaveLength(0);
    fireEvent.change(screen.getByRole('combobox', { name: 'Trạng thái bài viết' }), {
      target: { value: 'published' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(fetch).toHaveBeenLastCalledWith('/api/admin/blog', expect.objectContaining({
      method: 'PATCH',
      body: expect.stringContaining('"status":"published"'),
    }));
  });

  it('requires confirmation and removes a post through the admin API', async () => {
    vi.mocked(fetch).mockReset()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: [pendingPost] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ deletedId: pendingPost.id }),
      } as Response);

    render(<AdminBlogPanel />);

    expect(await screen.findAllByText(pendingPost.title)).not.toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Xóa bài viết' }));
    expect(screen.getByRole('alert')).toHaveTextContent('không thể hoàn tác');
    fireEvent.click(screen.getByRole('button', { name: 'Xóa vĩnh viễn' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(fetch).toHaveBeenLastCalledWith('/api/admin/blog', expect.objectContaining({
      method: 'DELETE',
      body: JSON.stringify({ id: pendingPost.id }),
    }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Xóa bài viết' })).not.toBeInTheDocument());
  });
});
