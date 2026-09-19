import type { MetadataRoute } from 'next';
import { getPublishedBlogSitemapEntries } from '@/lib/blog-server';
import { getSiteUrl } from '@/lib/site';

export const revalidate = 300;

const STATIC_ROUTES = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/product', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/how-it-works', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/roommates', changeFrequency: 'daily', priority: 0.9 },
  { path: '/blog', changeFrequency: 'daily', priority: 0.9 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.7 },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  let blogPosts: Awaited<ReturnType<typeof getPublishedBlogSitemapEntries>> = [];
  try {
    blogPosts = await getPublishedBlogSitemapEntries();
  } catch {
    // Keep core pages discoverable even if the content API is temporarily unavailable.
  }

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${siteUrl}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.published_at || Date.now()),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ];
}
