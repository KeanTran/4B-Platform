import type { Metadata } from 'next';
import { BlogIndex } from '@/components/marketing/BlogIndex';
import { getPublishedBlogPosts } from '@/lib/blog-server';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Blog về ở ghép và quản lý chi tiêu',
  description: 'Góc chia sẻ kinh nghiệm quản lý chi tiêu và cuộc sống ở ghép từ cộng đồng 4B.',
  alternates: { canonical: '/blog' },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/blog',
    title: 'Blog về ở ghép và quản lý chi tiêu | 4B',
    description: 'Kinh nghiệm quản lý chi tiêu, sống chung dễ chịu và câu chuyện thật từ cộng đồng ở ghép.',
    siteName: '4B Platform',
  },
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();
  return <BlogIndex posts={posts} />;
}
