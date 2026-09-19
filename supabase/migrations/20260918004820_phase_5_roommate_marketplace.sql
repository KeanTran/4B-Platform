-- Phase 5: public roommate discovery and forum data with private ownership.
-- Public rows never expose email, phone, or auth metadata. Profiles are only
-- discoverable after an explicit opt-in by their owner.

create table public.roommate_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 80),
  birth_year smallint check (birth_year between 1940 and 2100),
  occupation text check (occupation is null or char_length(occupation) <= 120),
  city text not null check (char_length(trim(city)) between 2 and 100),
  district text not null check (char_length(trim(district)) between 2 and 100),
  budget_min integer not null check (budget_min >= 0),
  budget_max integer not null check (budget_max >= budget_min),
  move_in_date date,
  bio text not null default '' check (char_length(bio) <= 1000),
  habits text[] not null default '{}',
  gender text not null default 'prefer_not_to_say'
    check (gender in ('female', 'male', 'other', 'prefer_not_to_say')),
  preferred_gender text not null default 'any'
    check (preferred_gender in ('female', 'male', 'other', 'any')),
  smoking boolean not null default false,
  has_pets boolean not null default false,
  avatar_url text check (avatar_url is null or char_length(avatar_url) <= 1000),
  is_discoverable boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.roommate_profiles is
  'Opt-in public roommate profiles. Contact details remain outside this table.';

alter table public.roommate_profiles enable row level security;

revoke all on table public.roommate_profiles from anon, authenticated;
grant select (
  id,
  display_name,
  birth_year,
  occupation,
  city,
  district,
  budget_min,
  budget_max,
  move_in_date,
  bio,
  habits,
  gender,
  preferred_gender,
  smoking,
  has_pets,
  avatar_url,
  is_discoverable,
  created_at,
  updated_at
) on public.roommate_profiles to anon, authenticated;
grant insert, update, delete on table public.roommate_profiles to authenticated;

create policy "Anyone can read discoverable roommate profiles"
on public.roommate_profiles
for select
to anon
using (is_discoverable = true);

create policy "Users can read discoverable or own roommate profiles"
on public.roommate_profiles
for select
to authenticated
using (is_discoverable = true or (select auth.uid()) = user_id);

create policy "Users can create their own roommate profile"
on public.roommate_profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own roommate profile"
on public.roommate_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own roommate profile"
on public.roommate_profiles
for delete
to authenticated
using ((select auth.uid()) = user_id);

create index roommate_profiles_discovery_idx
on public.roommate_profiles (city, district, budget_min, budget_max)
where is_discoverable = true;

create table public.roommate_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null check (char_length(trim(author_name)) between 2 and 80),
  title text not null check (char_length(trim(title)) between 8 and 160),
  content text not null check (char_length(trim(content)) between 20 and 3000),
  city text not null check (char_length(trim(city)) between 2 and 100),
  district text not null check (char_length(trim(district)) between 2 and 100),
  budget_min integer not null check (budget_min >= 0),
  budget_max integer not null check (budget_max >= budget_min),
  move_in_date date,
  tags text[] not null default '{}',
  status text not null default 'published'
    check (status in ('draft', 'published', 'closed', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.roommate_posts is
  'Roommate forum posts. Public reads are limited to published posts.';

alter table public.roommate_posts enable row level security;

revoke all on table public.roommate_posts from anon, authenticated;
grant select (
  id,
  author_name,
  title,
  content,
  city,
  district,
  budget_min,
  budget_max,
  move_in_date,
  tags,
  status,
  created_at,
  updated_at
) on public.roommate_posts to anon, authenticated;
grant insert, update, delete on table public.roommate_posts to authenticated;

create policy "Anyone can read published roommate posts"
on public.roommate_posts
for select
to anon
using (status = 'published');

create policy "Users can read published or own roommate posts"
on public.roommate_posts
for select
to authenticated
using (status = 'published' or (select auth.uid()) = author_id);

create policy "Users can create their own roommate posts"
on public.roommate_posts
for insert
to authenticated
with check ((select auth.uid()) = author_id);

create policy "Users can update their own roommate posts"
on public.roommate_posts
for update
to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

create policy "Users can delete their own roommate posts"
on public.roommate_posts
for delete
to authenticated
using ((select auth.uid()) = author_id);

create index roommate_posts_author_id_idx
on public.roommate_posts (author_id);

create index roommate_posts_feed_idx
on public.roommate_posts (created_at desc)
where status = 'published';

create index roommate_posts_location_idx
on public.roommate_posts (city, district, created_at desc)
where status = 'published';

create table public.roommate_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  profile_id uuid references public.roommate_profiles (id) on delete cascade,
  post_id uuid references public.roommate_posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint roommate_bookmarks_exactly_one_target
    check ((profile_id is not null)::integer + (post_id is not null)::integer = 1)
);

comment on table public.roommate_bookmarks is
  'Private saved profiles and forum posts for one authenticated user.';

alter table public.roommate_bookmarks enable row level security;

revoke all on table public.roommate_bookmarks from anon, authenticated;
grant select, insert, delete on table public.roommate_bookmarks to authenticated;

create policy "Users can read their own roommate bookmarks"
on public.roommate_bookmarks
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own roommate bookmarks"
on public.roommate_bookmarks
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own roommate bookmarks"
on public.roommate_bookmarks
for delete
to authenticated
using ((select auth.uid()) = user_id);

create index roommate_bookmarks_profile_id_idx
on public.roommate_bookmarks (profile_id)
where profile_id is not null;

create index roommate_bookmarks_post_id_idx
on public.roommate_bookmarks (post_id)
where post_id is not null;

create unique index roommate_bookmarks_unique_profile_idx
on public.roommate_bookmarks (user_id, profile_id)
where profile_id is not null;

create unique index roommate_bookmarks_unique_post_idx
on public.roommate_bookmarks (user_id, post_id)
where post_id is not null;
