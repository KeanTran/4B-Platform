-- Phase 6: private, two-way roommate connection requests.
-- This table is server-managed so auth user identifiers and private request
-- history never become directly readable through the public Data API.

create table public.roommate_connections (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references auth.users (id) on delete cascade,
  recipient_user_id uuid not null references auth.users (id) on delete cascade,
  member_low uuid generated always as (least(requester_user_id, recipient_user_id)) stored,
  member_high uuid generated always as (greatest(requester_user_id, recipient_user_id)) stored,
  message text not null default '' check (char_length(message) <= 500),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roommate_connections_different_members
    check (requester_user_id <> recipient_user_id),
  constraint roommate_connections_unique_pair
    unique (member_low, member_high)
);

comment on table public.roommate_connections is
  'Private roommate connection requests managed only by authenticated server routes.';

alter table public.roommate_connections enable row level security;

revoke all on table public.roommate_connections from anon, authenticated;
grant select, insert, update, delete on table public.roommate_connections to service_role;

create index roommate_connections_requester_idx
on public.roommate_connections (requester_user_id, updated_at desc);

create index roommate_connections_recipient_idx
on public.roommate_connections (recipient_user_id, updated_at desc);

create index roommate_connections_pending_recipient_idx
on public.roommate_connections (recipient_user_id, created_at desc)
where status = 'pending';
