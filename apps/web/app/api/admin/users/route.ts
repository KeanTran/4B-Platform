import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminAccess } from '@/lib/auth/roles';
import { createAdminClient } from '@/lib/supabase/admin';
import type { AppRole } from '@/types/auth';

const updateRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['admin', 'user']),
});

async function authorizeAdmin() {
  const access = await requireAdminAccess();
  if (!access.authenticated) {
    return { access, response: NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 }) };
  }
  if (!access.authorized) {
    return { access, response: NextResponse.json({ error: 'Bạn không có quyền quản trị.' }, { status: 403 }) };
  }
  return { access, response: null };
}

export async function GET() {
  try {
    const authorization = await authorizeAdmin();
    if (authorization.response) return authorization.response;
    const admin = createAdminClient();
    const [usersResult, rolesResult] = await Promise.all([
      admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
      admin.from('user_roles').select('user_id, role'),
    ]);
    if (usersResult.error || rolesResult.error) {
      throw new Error(usersResult.error?.message ?? rolesResult.error?.message);
    }

    const roles = new Map(
      ((rolesResult.data ?? []) as Array<{ user_id: string; role: AppRole }>).map((item) => [item.user_id, item.role]),
    );
    const users = usersResult.data.users.map((user) => ({
      id: user.id,
      email: user.email ?? '',
      display_name:
        typeof user.user_metadata?.full_name === 'string'
          ? user.user_metadata.full_name
          : user.email?.split('@')[0] ?? 'Thành viên 4B',
      role: roles.get(user.id) === 'admin' ? 'admin' : 'user',
      created_at: user.created_at,
    }));

    return NextResponse.json({ users, current_user_id: authorization.access.userId });
  } catch {
    return NextResponse.json({ error: 'Không thể tải danh sách người dùng.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authorization = await authorizeAdmin();
    if (authorization.response) return authorization.response;
    const input = updateRoleSchema.parse(await request.json());
    if (input.user_id === authorization.access.userId && input.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bạn không thể tự hạ quyền tài khoản admin đang sử dụng.' },
        { status: 409 },
      );
    }

    const { data, error } = await createAdminClient()
      .from('user_roles')
      .upsert(
        {
          user_id: input.user_id,
          role: input.role,
          assigned_by: authorization.access.userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
      .select('user_id, role, updated_at')
      .single();
    if (error || !data) throw new Error(error?.message ?? 'Không cập nhật được vai trò.');

    return NextResponse.json({ role: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Vai trò hoặc người dùng không hợp lệ.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Không thể cập nhật vai trò.' }, { status: 500 });
  }
}
