import 'server-only';

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_BLOG_SELECT } from '@/lib/blog';
import type { PublicBlogPost } from '@/types/blog';

export type BlogSitemapEntry = Pick<PublicBlogPost, 'slug' | 'published_at' | 'updated_at'>;

function createPublicBlogClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || url.includes('placeholder')) return null;

  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function queryPublishedBlogPosts(): Promise<PublicBlogPost[]> {
  const supabase = createPublicBlogClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('blog_posts')
    .select(PUBLIC_BLOG_SELECT)
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) throw new Error('Không thể tải danh sách bài viết.');
  return (data ?? []) as unknown as PublicBlogPost[];
}

async function queryPublishedBlogPostBySlug(slug: string): Promise<PublicBlogPost | null> {
  const supabase = createPublicBlogClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('blog_posts')
    .select(PUBLIC_BLOG_SELECT)
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw new Error('Không thể tải bài viết.');
  return data as unknown as PublicBlogPost | null;
}

async function queryRelatedBlogPosts(category: string, excludedId: string): Promise<PublicBlogPost[]> {
  const supabase = createPublicBlogClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('blog_posts')
    .select(PUBLIC_BLOG_SELECT)
    .eq('status', 'published')
    .eq('category', category)
    .neq('id', excludedId)
    .order('published_at', { ascending: false })
    .limit(3);
  if (error) throw new Error('Không thể tải bài viết liên quan.');
  return (data ?? []) as unknown as PublicBlogPost[];
}

async function queryPublishedBlogSitemapEntries(): Promise<BlogSitemapEntry[]> {
  const supabase = createPublicBlogClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug, published_at, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });
  if (error) throw new Error('Không thể tải dữ liệu sitemap Blog.');
  return (data ?? []) as BlogSitemapEntry[];
}

export const getPublishedBlogPosts = unstable_cache(
  queryPublishedBlogPosts,
  ['published-blog-posts-v1'],
  { revalidate: 300, tags: ['blog'] },
);

const getCachedPublishedBlogPostBySlug = unstable_cache(
  queryPublishedBlogPostBySlug,
  ['published-blog-post-by-slug-v1'],
  { revalidate: 300, tags: ['blog'] },
);

export const getPublishedBlogPostBySlug = cache(getCachedPublishedBlogPostBySlug);

export const getRelatedBlogPosts = unstable_cache(
  queryRelatedBlogPosts,
  ['related-published-blog-posts-v1'],
  { revalidate: 300, tags: ['blog'] },
);

export const getPublishedBlogSitemapEntries = unstable_cache(
  queryPublishedBlogSitemapEntries,
  ['published-blog-sitemap-entries-v1'],
  { revalidate: 300, tags: ['blog'] },
);
