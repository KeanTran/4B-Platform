import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient, isSupabaseServerConfigured } from '@/lib/supabase/server';

const supportMessageSchema = z.object({
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(6).max(32).optional().or(z.literal('')),
  message: z.string().trim().min(10).max(2000),
  source_path: z.string().trim().startsWith('/').max(512).optional(),
  website: z.string().max(200).optional(),
}).strict();

export async function POST(request: NextRequest) {
  try {
    const input = supportMessageSchema.parse(await request.json());

    // Honeypot: bots receive a normal response without writing spam to the inbox.
    if (input.website) {
      return NextResponse.json({ message: 'Yêu cầu hỗ trợ đã được tiếp nhận.' }, { status: 201 });
    }

    let userId: string | null = null;
    if (isSupabaseServerConfigured()) {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    }

    const { data, error } = await createAdminClient()
      .from('support_messages')
      .insert({
        user_id: userId,
        email: input.email.toLocaleLowerCase('vi'),
        phone: input.phone || null,
        message: input.message,
        source_path: input.source_path ?? null,
        status: 'new',
      })
      .select('id, created_at')
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Không thể lưu yêu cầu hỗ trợ.');

    return NextResponse.json({
      ticket: data,
      message: 'Yêu cầu đã vào hộp thư hỗ trợ. 4B sẽ phản hồi qua email hoặc số điện thoại bạn cung cấp.',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Email, số điện thoại hoặc nội dung hỗ trợ chưa hợp lệ.' },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Chưa thể gửi yêu cầu. Vui lòng thử lại sau.' }, { status: 500 });
  }
}
