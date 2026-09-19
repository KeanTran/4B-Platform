import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminAccess } from '@/lib/auth/roles';
import { createAdminClient } from '@/lib/supabase/admin';
import { SUPPORT_STATUSES } from '@/types/support';

const updateSupportSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(SUPPORT_STATUSES),
  admin_note: z.string().trim().max(2000).nullable().optional(),
}).strict();

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

    const { data, error } = await createAdminClient()
      .from('support_messages')
      .select('id, user_id, email, phone, message, source_path, status, admin_note, handled_by, handled_at, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(250);

    if (error) throw new Error(error.message);
    return NextResponse.json({ messages: data ?? [] });
  } catch {
    return NextResponse.json({ error: 'Không thể tải hộp thư hỗ trợ.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authorization = await authorizeAdmin();
    if (authorization.response) return authorization.response;
    const input = updateSupportSchema.parse(await request.json());
    const now = new Date().toISOString();
    const isHandled = input.status === 'in_progress' || input.status === 'resolved';

    const { data, error } = await createAdminClient()
      .from('support_messages')
      .update({
        status: input.status,
        admin_note: input.admin_note || null,
        handled_by: isHandled ? authorization.access.userId : null,
        handled_at: isHandled ? now : null,
        updated_at: now,
      })
      .eq('id', input.id)
      .select('id, user_id, email, phone, message, source_path, status, admin_note, handled_by, handled_at, created_at, updated_at')
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Không thể cập nhật yêu cầu.');
    return NextResponse.json({ message: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dữ liệu cập nhật không hợp lệ.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Không thể cập nhật yêu cầu hỗ trợ.' }, { status: 500 });
  }
}
