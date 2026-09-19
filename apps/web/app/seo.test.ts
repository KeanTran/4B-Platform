import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getPublishedBlogSitemapEntries: vi.fn(),
}));

vi.mock('@/lib/blog-server', () => ({
  getPublishedBlogSitemapEntries: mocks.getPublishedBlogSitemapEntries,
}));

import robots from './robots';
import sitemap from './sitemap';
import { buildHomeJsonLd, getGoogleSiteVerification, serializeJsonLd } from '@/lib/site';

describe('technical SEO', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://4b.example');
    mocks.getPublishedBlogSitemapEntries.mockResolvedValue([
      {
        slug: 'song-chung-can-bang',
        published_at: '2026-09-18T00:00:00.000Z',
        updated_at: '2026-09-19T00:00:00.000Z',
      },
    ]);
  });

  it('exposes public pages and published blog posts in the sitemap', async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual(expect.arrayContaining([
      'https://4b.example/',
      'https://4b.example/roommates',
      'https://4b.example/blog',
      'https://4b.example/blog/song-chung-can-bang',
    ]));
    expect(urls.some((url) => url.includes('/dashboard'))).toBe(false);
    expect(urls.some((url) => url.includes('/admin'))).toBe(false);
  });

  it('keeps static pages discoverable if blog storage is unavailable', async () => {
    mocks.getPublishedBlogSitemapEntries.mockRejectedValueOnce(new Error('offline'));
    const entries = await sitemap();

    expect(entries.map((entry) => entry.url)).toContain('https://4b.example/blog');
    expect(entries.some((entry) => entry.url.includes('/blog/song-chung-can-bang'))).toBe(false);
  });

  it('points crawlers to the sitemap while blocking private and utility routes', () => {
    const config = robots();

    expect(config.sitemap).toBe('https://4b.example/sitemap.xml');
    expect(config.host).toBe('https://4b.example');
    expect(config.rules).toMatchObject({
      userAgent: '*',
      allow: '/',
      disallow: expect.arrayContaining(['/admin/', '/api/', '/dashboard', '/login']),
    });
  });

  it('builds safe, absolute structured data for the home page', () => {
    const structuredData = buildHomeJsonLd();
    const graph = structuredData['@graph'];

    expect(graph.map((entry) => entry['@type'])).toEqual([
      'Organization',
      'WebSite',
      'SoftwareApplication',
    ]);
    expect(graph[0]?.url).toBe('https://4b.example');
    expect(serializeJsonLd({ value: '</script>' })).not.toContain('</script>');
  });

  it('normalizes the optional Google Search Console verification token', () => {
    vi.stubEnv('GOOGLE_SITE_VERIFICATION', '  search-console-token  ');
    expect(getGoogleSiteVerification()).toBe('search-console-token');
  });
});
