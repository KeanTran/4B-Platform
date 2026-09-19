export const BLOG_STATUSES = ['pending', 'draft', 'published', 'archived'] as const;

export type BlogStatus = (typeof BLOG_STATUSES)[number];

export interface PublicBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  author_name: string;
  category: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  likes_count: number;
  views_count: number;
  status: 'published';
  seo_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminBlogPost extends Omit<PublicBlogPost, 'status'> {
  status: BlogStatus;
  created_by: string | null;
  approved_by: string | null;
}
