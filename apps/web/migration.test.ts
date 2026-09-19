import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Phase 1 workspace migration', () => {
  const migrationDirectory = resolve(process.cwd(), '../../supabase/migrations');
  const migrationName = readdirSync(migrationDirectory).find((name) =>
    name.endsWith('_phase_1_workspace_foundation.sql'),
  );

  it('keeps workspaces private and owner-scoped', () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationDirectory, migrationName!), 'utf8');

    expect(sql).toContain('alter table public.user_workspaces enable row level security');
    expect(sql).toContain('revoke all on table public.user_workspaces from anon');
    expect(sql).toContain('grant select, insert, update, delete');
    expect(sql).toContain('using ((select auth.uid()) = user_id)');
    expect(sql).toContain('with check ((select auth.uid()) = user_id)');
    expect(sql).not.toContain('to anon');
    expect(sql).not.toContain('security definer');
  });
});

describe('Phase 4 AI usage migration', () => {
  const migrationDirectory = resolve(process.cwd(), '../../supabase/migrations');
  const migrationName = readdirSync(migrationDirectory).find((name) =>
    name.endsWith('_phase_4_ai_usage_limits.sql'),
  );

  it('enforces service-role-only access with RLS', () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationDirectory, migrationName!), 'utf8');

    expect(sql).toContain('alter table public.ai_user_plans enable row level security');
    expect(sql).toContain('alter table public.ai_usage_monthly enable row level security');
    expect(sql).toContain('revoke all on table public.ai_usage_monthly from authenticated');
    expect(sql).toContain('grant select, insert, update, delete on table public.ai_usage_monthly to service_role');
    expect(sql).toContain('security invoker');
    expect(sql).not.toContain('security definer');
  });

  it('reserves quota atomically without storing conversation content', () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationDirectory, migrationName!), 'utf8');

    expect(sql).toContain('on conflict (subject_hash, period_start)');
    expect(sql).toContain('where public.ai_usage_monthly.request_count < p_limit');
    expect(sql).toContain('char_length(subject_hash) = 64');
    expect(sql).not.toMatch(/\bprompt\s+(text|json|jsonb)/i);
    expect(sql).not.toMatch(/\bresponse\s+(text|json|jsonb)/i);
  });
});

describe('Phase 5 roommate marketplace migration', () => {
  const migrationDirectory = resolve(process.cwd(), '../../supabase/migrations');
  const migrationName = readdirSync(migrationDirectory).find((name) =>
    name.endsWith('_phase_5_roommate_marketplace.sql'),
  );

  it('protects owned data with RLS and explicit grants', () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationDirectory, migrationName!), 'utf8');

    for (const table of ['roommate_profiles', 'roommate_posts', 'roommate_bookmarks']) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
      expect(sql).toContain(`revoke all on table public.${table} from anon, authenticated`);
    }
    expect(sql).toContain('using ((select auth.uid()) = user_id)');
    expect(sql).toContain('with check ((select auth.uid()) = author_id)');
    expect(sql).toContain('on public.roommate_profiles to anon, authenticated');
    expect(sql).toContain('on public.roommate_posts to anon, authenticated');
    expect(sql).not.toContain('grant select, insert, update, delete on table public.roommate_profiles');
    expect(sql).not.toContain('security definer');
  });

  it('only exposes opted-in profiles and published posts publicly', () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationDirectory, migrationName!), 'utf8');
    const executableSql = sql.replace(/^--.*$/gm, '');

    expect(sql).toContain('using (is_discoverable = true)');
    expect(sql).toContain("using (status = 'published')");
    expect(sql).toContain('grant select (');
    expect(executableSql).not.toMatch(/\b(email|phone)\b/i);
  });

  it('allows one bookmark target and prevents duplicate saved items', () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationDirectory, migrationName!), 'utf8');

    expect(sql).toContain('constraint roommate_bookmarks_exactly_one_target');
    expect(sql).toContain('create unique index roommate_bookmarks_unique_profile_idx');
    expect(sql).toContain('where profile_id is not null');
    expect(sql).toContain('create unique index roommate_bookmarks_unique_post_idx');
    expect(sql).toContain('where post_id is not null');
  });
});

describe('Phase 6 roommate connections migration', () => {
  const migrationDirectory = resolve(process.cwd(), '../../supabase/migrations');
  const migrationName = readdirSync(migrationDirectory).find((name) =>
    name.endsWith('_phase_6_roommate_connections.sql'),
  );

  it('keeps connection requests private and server-managed', () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationDirectory, migrationName!), 'utf8');

    expect(sql).toContain('alter table public.roommate_connections enable row level security');
    expect(sql).toContain('revoke all on table public.roommate_connections from anon, authenticated');
    expect(sql).toContain('grant select, insert, update, delete on table public.roommate_connections to service_role');
    expect(sql).not.toContain('to anon');
    expect(sql).not.toContain('to authenticated');
    expect(sql).not.toContain('security definer');
  });

  it('prevents self-connections and duplicate pairs in either direction', () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationDirectory, migrationName!), 'utf8');

    expect(sql).toContain('check (requester_user_id <> recipient_user_id)');
    expect(sql).toContain('least(requester_user_id, recipient_user_id)');
    expect(sql).toContain('greatest(requester_user_id, recipient_user_id)');
    expect(sql).toContain('unique (member_low, member_high)');
    expect(sql).toContain('roommate_connections_requester_idx');
    expect(sql).toContain('roommate_connections_recipient_idx');
  });
});

describe('Phase 7 user roles migration', () => {
  const migrationDirectory = resolve(process.cwd(), '../../supabase/migrations');
  const migrationName = readdirSync(migrationDirectory).find((name) =>
    name.endsWith('_phase_7_user_roles.sql'),
  );

  it('keeps role writes server-managed while users can read only their own role', () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationDirectory, migrationName!), 'utf8');

    expect(sql).toContain('alter table public.user_roles enable row level security');
    expect(sql).toContain('revoke all on table public.user_roles from anon, authenticated');
    expect(sql).toContain('grant select (user_id, role, created_at, updated_at)');
    expect(sql).toContain('grant select, insert, update, delete on table public.user_roles to service_role');
    expect(sql).toContain('using ((select auth.uid()) = user_id)');
  });

  it('defaults existing and future accounts to user without exposing the trigger function', () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationDirectory, migrationName!), 'utf8');

    expect(sql).toContain("select id, 'user'");
    expect(sql).toContain("values (new.id, 'user')");
    expect(sql).toContain('function private.assign_default_user_role()');
    expect(sql).toContain('security definer');
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain('revoke all on function private.assign_default_user_role()');
    expect(sql).not.toContain('function public.assign_default_user_role');
  });
});

describe('Phase 8 blog SEO editorial migration', () => {
  const migrationDirectory = resolve(process.cwd(), '../../supabase/migrations');
  const migrationName = readdirSync(migrationDirectory).find((name) =>
    name.endsWith('_phase_8_blog_seo_editorial.sql'),
  );

  it('backfills stable slugs and adds editorial SEO fields', () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationDirectory, migrationName!), 'utf8');

    expect(sql).toContain('add column if not exists status text not null default');
    expect(sql).toContain('add column if not exists seo_title text');
    expect(sql).toContain('add column if not exists meta_description text');
    expect(sql).toContain("left(replace(posts.id::text, '-', ''), 8)");
    expect(sql).toContain('alter column slug set not null');
    expect(sql).toContain('create unique index blog_posts_slug_unique_idx');
    expect(sql).toContain("where status = 'published'");
  });

  it('makes community submissions pending and admin publication server-managed', () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationDirectory, migrationName!), 'utf8');

    expect(sql).toContain('revoke all on table public.blog_posts from anon, authenticated');
    expect(sql).toContain('grant insert (');
    expect(sql).toContain('on table public.blog_posts to authenticated');
    expect(sql).toContain('grant select, insert, update, delete on table public.blog_posts to service_role');
    expect(sql).toContain("and status = 'pending'");
    expect(sql).toContain('(select auth.uid()) = created_by');
    expect(sql).not.toContain('to anon\nwith check');
  });

  it('keeps publication state synchronized without a security definer function', () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationDirectory, migrationName!), 'utf8');

    expect(sql).toContain('function private.sync_blog_publication_fields()');
    expect(sql).toContain('security invoker');
    expect(sql).toContain("new.is_published := new.status = 'published'");
    expect(sql).toContain("new.published_at := now()");
    expect(sql).toContain('set search_path =');
    expect(sql).not.toContain('security definer');
  });
});

describe('Phase 8 support inbox migration', () => {
  const migrationDirectory = resolve(process.cwd(), '../../supabase/migrations');
  const migrationName = readdirSync(migrationDirectory).find((name) =>
    name.endsWith('_phase_8_support_inbox.sql'),
  );

  it('keeps support requests server-managed and protected by RLS', () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationDirectory, migrationName!), 'utf8');

    expect(sql).toContain('create table public.support_messages');
    expect(sql).toContain('alter table public.support_messages enable row level security');
    expect(sql).toContain('revoke all on table public.support_messages from anon, authenticated');
    expect(sql).toContain('grant select, insert, update on table public.support_messages to service_role');
    expect(sql).not.toMatch(/create policy[\s\S]+to anon/i);
  });

  it('constrains workflow fields and indexes admin filters and foreign keys', () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationDirectory, migrationName!), 'utf8');

    expect(sql).toContain("status in ('new', 'in_progress', 'resolved', 'spam')");
    expect(sql).toContain('support_messages_status_created_at_idx');
    expect(sql).toContain('support_messages_user_id_idx');
    expect(sql).toContain('support_messages_handled_by_idx');
    expect(sql).toContain('char_length(trim(message)) between 10 and 2000');
  });
});

describe('Phase 9 Blog discovery migration', () => {
  const migrationDirectory = resolve(process.cwd(), '../../supabase/migrations');
  const migrationName = readdirSync(migrationDirectory).find((name) =>
    name.endsWith('_phase_9_blog_discovery.sql'),
  );

  it('adds a partial composite index for related published articles', () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationDirectory, migrationName!), 'utf8');

    expect(sql).toContain('create index blog_posts_published_category_idx');
    expect(sql).toContain('(category, published_at desc)');
    expect(sql).toContain("where status = 'published'");
  });
});
