import type { BlogStatus } from '@/types/blog';

export const PUBLIC_BLOG_COLUMNS = [
  'id',
  'title',
  'slug',
  'content',
  'excerpt',
  'author_name',
  'category',
  'cover_image_url',
  'cover_image_alt',
  'likes_count',
  'views_count',
  'status',
  'seo_title',
  'meta_description',
  'published_at',
  'created_at',
  'updated_at',
] as const;

export const ADMIN_BLOG_COLUMNS = [
  ...PUBLIC_BLOG_COLUMNS,
  'created_by',
  'approved_by',
] as const;

export const PUBLIC_BLOG_SELECT = PUBLIC_BLOG_COLUMNS.join(', ');
export const ADMIN_BLOG_SELECT = ADMIN_BLOG_COLUMNS.join(', ');

export const BLOG_STATUS_LABELS: Record<BlogStatus, string> = {
  pending: 'Chờ duyệt',
  draft: 'Bản nháp',
  published: 'Đã xuất bản',
  archived: 'Đã lưu trữ',
};

export function slugifyBlogTitle(value: string) {
  const slug = value
    .trim()
    .toLocaleLowerCase('vi')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180)
    .replace(/-+$/g, '');

  return slug || 'bai-viet';
}

export function getBlogReadingMinutes(content: string) {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function formatBlogDate(value: string | null) {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
}

export function isSupportedBlogCoverUrl(value: string | null) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (
      url.hostname.endsWith('.supabase.co') ||
      url.hostname.endsWith('.googleusercontent.com') ||
      url.hostname === 'graph.facebook.com'
    );
  } catch {
    return false;
  }
}
