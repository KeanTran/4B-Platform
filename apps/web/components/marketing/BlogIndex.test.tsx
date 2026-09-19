import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PublicBlogPost } from '@/types/blog';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { BlogIndex } from './BlogIndex';
import { BlogArticle } from './BlogArticle';

const post: PublicBlogPost = {
  id: '11111111-1111-4111-8111-111111111111',
  title: 'Bí quyết ở ghép cân bằng',
  slug: 'bi-quyet-o-ghep-can-bang',
  content: 'Thống nhất chi phí từ đầu.\n\nTôn trọng không gian chung của nhau.',
  excerpt: 'Kinh nghiệm sống chung rõ ràng và dễ chịu.',
  author_name: 'Minh An',
  category: 'Kinh nghiệm',
  cover_image_url: null,
  cover_image_alt: null,
  likes_count: 0,
  views_count: 0,
  status: 'published',
  seo_title: null,
  meta_description: null,
  published_at: '2026-09-18T00:00:00.000Z',
  created_at: '2026-09-17T00:00:00.000Z',
  updated_at: '2026-09-18T01:00:00.000Z',
};

describe('indexable Blog presentation', () => {
  it('renders real links to article pages instead of modal-only cards', () => {
    render(<BlogIndex posts={[post]} />);
    expect(screen.getByRole('link', { name: post.title })).toHaveAttribute('href', `/blog/${post.slug}`);
    expect(screen.getByRole('button', { name: /viết bài chia sẻ/i })).toBeInTheDocument();
  });

  it('renders article content, structured data and internal conversion links', () => {
    const { container } = render(<BlogArticle post={post} relatedPosts={[]} />);
    expect(screen.getByRole('heading', { level: 1, name: post.title })).toBeInTheDocument();
    expect(screen.getByText('Thống nhất chi phí từ đầu.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Dùng Dashboard miễn phí/ })).toHaveAttribute('href', '/dashboard');
    expect(container.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
    expect(container.textContent).not.toContain('<script>');
  });
});
