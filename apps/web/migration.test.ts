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
