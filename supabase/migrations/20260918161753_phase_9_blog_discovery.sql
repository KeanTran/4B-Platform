-- Phase 9: support category-based related article discovery for public Blog pages.

create index blog_posts_published_category_idx
  on public.blog_posts (category, published_at desc)
  where status = 'published';

comment on index public.blog_posts_published_category_idx is
  'Supports related published article queries by category and recency.';
