import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

export function isSupabaseAdminConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return Boolean(
    url &&
      serviceRoleKey &&
      !url.includes('placeholder') &&
      !serviceRoleKey.includes('placeholder'),
  );
}

export function createAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    throw new Error('Supabase service role chưa được cấu hình.');
  }

  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  return adminClient;
}
