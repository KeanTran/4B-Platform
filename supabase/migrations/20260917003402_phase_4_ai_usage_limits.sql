-- Phase 4: server-enforced AI plans and monthly request usage.
-- Guest identifiers are random, first-party cookies and are stored only as
-- SHA-256 hashes. Raw prompts and model responses are never persisted here.

create table if not exists public.ai_user_plans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.ai_user_plans is
  'Server-managed AI entitlement for authenticated users. Missing rows are treated as Free.';

alter table public.ai_user_plans enable row level security;

revoke all on table public.ai_user_plans from anon;
revoke all on table public.ai_user_plans from authenticated;
grant select, insert, update, delete on table public.ai_user_plans to service_role;

create table if not exists public.ai_usage_monthly (
  subject_hash text not null check (char_length(subject_hash) = 64),
  period_start date not null,
  subject_kind text not null check (subject_kind in ('guest', 'user')),
  plan text not null check (plan in ('free', 'pro')),
  request_count integer not null default 0 check (request_count >= 0),
  input_tokens bigint not null default 0 check (input_tokens >= 0),
  output_tokens bigint not null default 0 check (output_tokens >= 0),
  last_model_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (subject_hash, period_start)
);

comment on table public.ai_usage_monthly is
  'Aggregated monthly AI usage. Contains no prompts, responses, raw guest IDs, names, or emails.';

alter table public.ai_usage_monthly enable row level security;

revoke all on table public.ai_usage_monthly from anon;
revoke all on table public.ai_usage_monthly from authenticated;
grant select, insert, update, delete on table public.ai_usage_monthly to service_role;

create or replace function public.reserve_ai_request(
  p_subject_hash text,
  p_subject_kind text,
  p_plan text,
  p_limit integer,
  p_model_id text
)
returns table (
  allowed boolean,
  used_count integer,
  limit_count integer,
  usage_period_start date
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_period_start date := date_trunc('month', timezone('utc', now()))::date;
  v_used_count integer;
begin
  if p_limit <= 0 then
    raise exception 'AI request limit must be positive' using errcode = '22023';
  end if;

  if p_subject_kind not in ('guest', 'user') then
    raise exception 'Invalid AI usage subject kind' using errcode = '22023';
  end if;

  if p_plan not in ('free', 'pro') then
    raise exception 'Invalid AI plan' using errcode = '22023';
  end if;

  insert into public.ai_usage_monthly (
    subject_hash,
    period_start,
    subject_kind,
    plan,
    request_count,
    last_model_id
  )
  values (
    p_subject_hash,
    v_period_start,
    p_subject_kind,
    p_plan,
    1,
    p_model_id
  )
  on conflict (subject_hash, period_start)
  do update
  set
    request_count = public.ai_usage_monthly.request_count + 1,
    subject_kind = excluded.subject_kind,
    plan = excluded.plan,
    last_model_id = excluded.last_model_id,
    updated_at = now()
  where public.ai_usage_monthly.request_count < p_limit
  returning request_count into v_used_count;

  if v_used_count is null then
    select usage.request_count
    into v_used_count
    from public.ai_usage_monthly as usage
    where usage.subject_hash = p_subject_hash
      and usage.period_start = v_period_start;

    return query select false, coalesce(v_used_count, p_limit), p_limit, v_period_start;
    return;
  end if;

  return query select true, v_used_count, p_limit, v_period_start;
end;
$$;

create or replace function public.record_ai_token_usage(
  p_subject_hash text,
  p_input_tokens integer,
  p_output_tokens integer
)
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.ai_usage_monthly
  set
    input_tokens = input_tokens + greatest(coalesce(p_input_tokens, 0), 0),
    output_tokens = output_tokens + greatest(coalesce(p_output_tokens, 0), 0),
    updated_at = now()
  where subject_hash = p_subject_hash
    and period_start = date_trunc('month', timezone('utc', now()))::date;
$$;

create or replace function public.release_ai_request(p_subject_hash text)
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.ai_usage_monthly
  set
    request_count = greatest(request_count - 1, 0),
    updated_at = now()
  where subject_hash = p_subject_hash
    and period_start = date_trunc('month', timezone('utc', now()))::date;
$$;

revoke all on function public.reserve_ai_request(text, text, text, integer, text)
  from public, anon, authenticated;
revoke all on function public.record_ai_token_usage(text, integer, integer)
  from public, anon, authenticated;
revoke all on function public.release_ai_request(text)
  from public, anon, authenticated;

grant execute on function public.reserve_ai_request(text, text, text, integer, text)
  to service_role;
grant execute on function public.record_ai_token_usage(text, integer, integer)
  to service_role;
grant execute on function public.release_ai_request(text)
  to service_role;
