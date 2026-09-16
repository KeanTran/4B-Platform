-- Phase 1: a private, user-owned workspace envelope for future cloud sync.
-- Guest workspaces intentionally remain on-device and never reach this table.

create table if not exists public.user_workspaces (
  user_id uuid primary key references auth.users (id) on delete cascade,
  workspace jsonb not null default '{}'::jsonb,
  schema_version integer not null default 1 check (schema_version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_workspaces_workspace_is_object
    check (jsonb_typeof(workspace) = 'object')
);

comment on table public.user_workspaces is
  'Private cloud-sync envelope. Guest data is stored locally and is never inserted here.';

alter table public.user_workspaces enable row level security;

-- Supabase no longer guarantees automatic Data API grants for newly-created
-- tables. Keep guest access closed and grant only the operations the signed-in
-- owner needs.
revoke all on table public.user_workspaces from anon;
revoke all on table public.user_workspaces from authenticated;
grant select, insert, update, delete on table public.user_workspaces to authenticated;

create policy "Users can read their own workspace"
on public.user_workspaces
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own workspace"
on public.user_workspaces
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own workspace"
on public.user_workspaces
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own workspace"
on public.user_workspaces
for delete
to authenticated
using ((select auth.uid()) = user_id);
