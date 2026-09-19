-- Phase 8: make community blog posts safe to publish and ready for SEO URLs.

create extension if not exists unaccent with schema extensions;
create schema if not exists private;

alter table public.blog_posts
  rename column image_url to cover_image_url;

alter table public.blog_posts
  add column if not exists status text not null default 'pending',
  add column if not exists seo_title text,
  add column if not exists meta_description text,
  add column if not exists cover_image_alt text,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists approved_by uuid references auth.users(id) on delete set null,
  add column if not exists published_at timestamptz;

update public.blog_posts
set status = case when is_published then 'published' else 'draft' end,
    published_at = case
      when is_published then coalesce(published_at, updated_at, created_at, now())
      else published_at
    end;

with normalized as (
  select
    id,
    coalesce(
      nullif(
        trim(both '-' from regexp_replace(
          lower(extensions.unaccent(coalesce(nullif(trim(slug), ''), title))),
          '[^a-z0-9]+',
          '-',
          'g'
        )),
        ''
      ),
      'bai-viet'
    ) as base_slug
  from public.blog_posts
)
update public.blog_posts as posts
set slug = left(normalized.base_slug, 180) || '-' || left(replace(posts.id::text, '-', ''), 8)
from normalized
where normalized.id = posts.id;

alter table public.blog_posts
  alter column slug set not null,
  alter column is_published set default false;

alter table public.blog_posts
  add constraint blog_posts_status_check
    check (status in ('pending', 'draft', 'published', 'archived')),
  add constraint blog_posts_title_length_check
    check (char_length(trim(title)) between 3 and 180),
  add constraint blog_posts_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 200),
  add constraint blog_posts_content_length_check
    check (char_length(trim(content)) between 20 and 50000),
  add constraint blog_posts_excerpt_length_check
    check (excerpt is null or char_length(excerpt) <= 500),
  add constraint blog_posts_seo_title_length_check
    check (seo_title is null or char_length(seo_title) <= 120),
  add constraint blog_posts_meta_description_length_check
    check (meta_description is null or char_length(meta_description) <= 320),
  add constraint blog_posts_cover_image_alt_length_check
    check (cover_image_alt is null or char_length(cover_image_alt) <= 240);

create unique index blog_posts_slug_unique_idx
  on public.blog_posts (slug);

create index blog_posts_published_at_idx
  on public.blog_posts (published_at desc)
  where status = 'published';

create index blog_posts_created_by_idx
  on public.blog_posts (created_by)
  where created_by is not null;

create index blog_posts_approved_by_idx
  on public.blog_posts (approved_by)
  where approved_by is not null;

create or replace function private.sync_blog_publication_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.is_published := new.status = 'published';
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function private.sync_blog_publication_fields()
  from public, anon, authenticated;

drop trigger if exists sync_blog_publication_fields on public.blog_posts;
create trigger sync_blog_publication_fields
before insert or update on public.blog_posts
for each row execute function private.sync_blog_publication_fields();

drop policy if exists "Public blog posts are viewable by everyone" on public.blog_posts;
drop policy if exists "Anyone can create blog posts" on public.blog_posts;
drop policy if exists "Anyone can read published blog posts" on public.blog_posts;
drop policy if exists "Authenticated users can read published or own blog posts" on public.blog_posts;
drop policy if exists "Authenticated users can submit pending blog posts" on public.blog_posts;

alter table public.blog_posts enable row level security;

revoke all on table public.blog_posts from anon, authenticated;

grant select (
  id,
  title,
  slug,
  content,
  excerpt,
  author_name,
  category,
  cover_image_url,
  cover_image_alt,
  likes_count,
  views_count,
  status,
  seo_title,
  meta_description,
  published_at,
  created_at,
  updated_at
) on table public.blog_posts to anon, authenticated;

grant insert (
  title,
  slug,
  content,
  excerpt,
  author_name,
  category,
  cover_image_url,
  cover_image_alt,
  seo_title,
  meta_description,
  status,
  created_by
) on table public.blog_posts to authenticated;

grant select, insert, update, delete on table public.blog_posts to service_role;

create policy "Anyone can read published blog posts"
on public.blog_posts
for select
to anon
using (status = 'published');

create policy "Authenticated users can read published or own blog posts"
on public.blog_posts
for select
to authenticated
using (status = 'published' or (select auth.uid()) = created_by);

create policy "Authenticated users can submit pending blog posts"
on public.blog_posts
for insert
to authenticated
with check (
  (select auth.uid()) = created_by
  and status = 'pending'
  and approved_by is null
  and published_at is null
);

comment on table public.blog_posts is
  'Community blog submissions. Public readers only see admin-approved published posts.';

comment on column public.blog_posts.status is
  'Editorial state: pending, draft, published, or archived.';

comment on column public.blog_posts.slug is
  'Stable, unique, URL-safe identifier used by public article pages and sitemaps.';
