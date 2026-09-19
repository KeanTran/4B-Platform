import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminAccess } from '@/lib/auth/roles';
import { ADMIN_BLOG_SELECT, slugifyBlogTitle } from '@/lib/blog';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidateTag } from 'next/cache';

const optionalNullableText = (max: number) =>
  z.string().trim().max(max).nullable().optional();

const updateBlogPostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(3).max(180).optional(),
  slug: z.string().trim().min(1).max(200).optional(),
  content: z.string().trim().min(20).max(50000).optional(),
  excerpt: optionalNullableText(500),
  author_name: z.string().trim().min(2).max(80).optional(),
  category: z.string().trim().min(2).max(80).optional(),
  seo_title: optionalNullableText(120),
  meta_description: optionalNullableText(320),
  cover_image_url: optionalNullableText(2000),
  cover_image_alt: optionalNullableText(240),
  status: z.enum(['pending', 'draft', 'published', 'archived']).optional(),
}).strict().refine((value) => Object.keys(value).length > 1, {
  message: 'Cần có ít nhất một thay đổi.',
});

const deleteBlogPostSchema = z.object({
  id: z.string().uuid(),
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
      .from('blog_posts')
      .select(ADMIN_BLOG_SELECT)
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);

    return NextResponse.json({ posts: data ?? [] });
  } catch {
    return NextResponse.json({ error: 'Không thể tải danh sách bài viết.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authorization = await authorizeAdmin();
    if (authorization.response) return authorization.response;
    const input = updateBlogPostSchema.parse(await request.json());
    const admin = createAdminClient();

    const { data: existing, error: existingError } = await admin
      .from('blog_posts')
      .select('status, published_at')
      .eq('id', input.id)
      .maybeSingle<{ status: string; published_at: string | null }>();
    if (existingError) throw new Error(existingError.message);
    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết.' }, { status: 404 });
    }

    const { id, slug, status, ...editableFields } = input;
    const updates: Record<string, unknown> = { ...editableFields };
    if (slug !== undefined) updates.slug = slugifyBlogTitle(slug);
    if (status !== undefined) {
      updates.status = status;
      if (status === 'published' && existing.status !== 'published') {
        updates.published_at = new Date().toISOString();
        updates.approved_by = authorization.access.userId;
      } else if (status === 'pending' || status === 'draft') {
        updates.published_at = null;
        updates.approved_by = null;
      }
    }

    const { data, error } = await admin
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select(ADMIN_BLOG_SELECT)
      .single();
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'Slug này đã được một bài viết khác sử dụng.' }, { status: 409 });
    }
    if (error || !data) throw new Error(error?.message ?? 'Không cập nhật được bài viết.');

    revalidateTag('blog', 'max');
    return NextResponse.json({ post: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Thông tin bài viết chưa hợp lệ.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Không thể cập nhật bài viết.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authorization = await authorizeAdmin();
    if (authorization.response) return authorization.response;
    const { id } = deleteBlogPostSchema.parse(await request.json());

    const { data, error } = await createAdminClient()
      .from('blog_posts')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle<{ id: string }>();
    if (error) throw new Error(error.message);
    if (!data) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết.' }, { status: 404 });
    }

    revalidateTag('blog', 'max');
    return NextResponse.json({ deletedId: data.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Bài viết cần xóa không hợp lệ.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Không thể xóa bài viết.' }, { status: 500 });
  }
}
