import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogArticle } from '@/components/marketing/BlogArticle';
import { getPublishedBlogPostBySlug, getPublishedBlogPosts, getRelatedBlogPosts } from '@/lib/blog-server';
import { buildBlogPostMetadata } from '@/lib/blog-seo';

export const revalidate = 300;

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: BlogPostPageProps): Promise<Metadata> {
  const params = await props.params;
  const post = await getPublishedBlogPostBySlug(params.slug);
  if (!post) {
    return {
      title: 'Không tìm thấy bài viết',
      robots: { index: false, follow: false },
    };
  }
  return buildBlogPostMetadata(post);
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const params = await props.params;
  const post = await getPublishedBlogPostBySlug(params.slug);
  if (!post) notFound();

  const relatedPosts = await getRelatedBlogPosts(post.category, post.id);
  return <BlogArticle post={post} relatedPosts={relatedPosts} />;
}
