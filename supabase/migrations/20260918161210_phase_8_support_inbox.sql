-- Phase 8 follow-up: route public support requests to an admin-managed inbox.

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  phone text,
  message text not null,
  source_path text,
  status text not null default 'new',
  admin_note text,
  handled_by uuid references auth.users(id) on delete set null,
  handled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_messages_email_length_check
    check (char_length(trim(email)) between 3 and 254),
  constraint support_messages_phone_length_check
    check (phone is null or char_length(trim(phone)) between 6 and 32),
  constraint support_messages_message_length_check
    check (char_length(trim(message)) between 10 and 2000),
  constraint support_messages_source_path_length_check
    check (source_path is null or char_length(source_path) <= 512),
  constraint support_messages_status_check
    check (status in ('new', 'in_progress', 'resolved', 'spam')),
  constraint support_messages_admin_note_length_check
    check (admin_note is null or char_length(admin_note) <= 2000)
);

create index support_messages_status_created_at_idx
  on public.support_messages (status, created_at desc);

create index support_messages_user_id_idx
  on public.support_messages (user_id)
  where user_id is not null;

create index support_messages_handled_by_idx
  on public.support_messages (handled_by)
  where handled_by is not null;

alter table public.support_messages enable row level security;

-- Requests must pass through the validated server route. Browsers receive no
-- direct table privileges, while the server-only service role manages the inbox.
revoke all on table public.support_messages from anon, authenticated;
grant select, insert, update on table public.support_messages to service_role;

comment on table public.support_messages is
  'Support requests submitted from Chat Now and processed in the admin Dashboard.';

comment on column public.support_messages.status is
  'Support workflow state: new, in_progress, resolved, or spam.';
