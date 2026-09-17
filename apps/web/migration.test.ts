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
