import type { Metadata } from 'next';
import type { PublicBlogPost } from '@/types/blog';
import { getSiteUrl } from '@/lib/site';

export function getBlogDescription(post: PublicBlogPost) {
  const fallback = post.excerpt || post.content.replace(/\s+/g, ' ').trim().slice(0, 157);
  return (post.meta_description || fallback).slice(0, 320);
}

export function buildBlogPostMetadata(post: PublicBlogPost): Metadata {
  const title = post.seo_title || post.title;
  const description = getBlogDescription(post);
  const pathname = `/blog/${post.slug}`;
  const images = post.cover_image_url
    ? [{ url: post.cover_image_url, alt: post.cover_image_alt || post.title }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: pathname },
    openGraph: {
      type: 'article',
      locale: 'vi_VN',
      url: pathname,
      title,
      description,
      siteName: '4B Platform',
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at,
      authors: [post.author_name],
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export function buildBlogPostJsonLd(post: PublicBlogPost) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/blog/${post.slug}`;
  return {
    article: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: getBlogDescription(post),
      url,
      mainEntityOfPage: url,
      datePublished: post.published_at || post.created_at,
      dateModified: post.updated_at,
      author: { '@type': 'Person', name: post.author_name },
      publisher: { '@type': 'Organization', name: '4B Platform', url: siteUrl },
      image: post.cover_image_url || undefined,
      articleSection: post.category,
      inLanguage: 'vi-VN',
    },
    breadcrumb: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ],
    },
  };
}
