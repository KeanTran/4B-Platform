import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { AppRole, CurrentUserAccess } from '@/types/auth';

function normalizeRole(value: unknown): AppRole {
  return value === 'admin' ? 'admin' : 'user';
}

export async function getCurrentUserAccess(): Promise<CurrentUserAccess> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { userId: null, role: 'user' };

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', authData.user.id)
    .maybeSingle<{ role: AppRole }>();
  if (error) throw new Error('Không thể kiểm tra quyền truy cập.');

  return { userId: authData.user.id, role: normalizeRole(data?.role) };
}

export async function requireAdminAccess() {
  const access = await getCurrentUserAccess();
  return {
    ...access,
    authenticated: Boolean(access.userId),
    authorized: access.role === 'admin',
  };
}

