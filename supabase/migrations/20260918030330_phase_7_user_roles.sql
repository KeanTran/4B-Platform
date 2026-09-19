-- Phase 7: application roles with a safe default for every Supabase user.

create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('admin', 'user')),
  assigned_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_roles is
  'Application role for each authenticated user. Role changes are server-managed.';

alter table public.user_roles enable row level security;

revoke all on table public.user_roles from anon, authenticated;
grant select (user_id, role, created_at, updated_at)
on public.user_roles to authenticated;
grant select, insert, update, delete on table public.user_roles to service_role;

create policy "Users can read their own application role"
on public.user_roles
for select
to authenticated
using ((select auth.uid()) = user_id);

create index user_roles_role_idx
on public.user_roles (role, updated_at desc);

insert into public.user_roles (user_id, role)
select id, 'user'
from auth.users
on conflict (user_id) do nothing;

create schema if not exists private;

create or replace function private.assign_default_user_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function private.assign_default_user_role()
from public, anon, authenticated;

drop trigger if exists on_auth_user_created_assign_role on auth.users;
create trigger on_auth_user_created_assign_role
after insert on auth.users
for each row execute function private.assign_default_user_role();
