import { describe, expect, it } from 'vitest';
import { buildBlogPostJsonLd, buildBlogPostMetadata } from './blog-seo';
import type { PublicBlogPost } from '@/types/blog';

const post: PublicBlogPost = {
  id: '11111111-1111-4111-8111-111111111111',
  title: 'Bí quyết ở ghép cân bằng',
  slug: 'bi-quyet-o-ghep-can-bang',
  content: 'Nội dung chia sẻ đủ dài về cách quản lý chi phí và không gian chung.',
  excerpt: 'Kinh nghiệm sống chung rõ ràng và dễ chịu.',
  author_name: 'Minh An',
  category: 'Kinh nghiệm',
  cover_image_url: 'https://example.supabase.co/storage/v1/object/public/blog/cover.jpg',
  cover_image_alt: 'Nhóm bạn cùng phòng',
  likes_count: 0,
  views_count: 0,
  status: 'published',
  seo_title: 'Ở ghép cân bằng: hướng dẫn thực tế',
  meta_description: 'Hướng dẫn quản lý chi phí và không gian chung khi ở ghép.',
  published_at: '2026-09-18T00:00:00.000Z',
  created_at: '2026-09-17T00:00:00.000Z',
  updated_at: '2026-09-18T01:00:00.000Z',
};

describe('Blog SEO metadata', () => {
  it('builds canonical, article and social metadata from editorial fields', () => {
    const metadata = buildBlogPostMetadata(post);
    expect(metadata.title).toBe(post.seo_title);
    expect(metadata.description).toBe(post.meta_description);
    expect(metadata.alternates?.canonical).toBe(`/blog/${post.slug}`);
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      url: `/blog/${post.slug}`,
      publishedTime: post.published_at,
    });
  });

  it('builds BlogPosting and Breadcrumb structured data with absolute URLs', () => {
    const jsonLd = buildBlogPostJsonLd(post);
    expect(jsonLd.article).toMatchObject({
      '@type': 'BlogPosting',
      headline: post.title,
      articleSection: post.category,
    });
    expect(jsonLd.article.url).toContain(`/blog/${post.slug}`);
    expect(jsonLd.breadcrumb.itemListElement).toHaveLength(3);
  });
});
