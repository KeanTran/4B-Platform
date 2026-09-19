import { randomUUID } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PUBLIC_BLOG_SELECT, slugifyBlogTitle } from '@/lib/blog';

const createBlogPostSchema = z.object({
  title: z.string().trim().min(3).max(180),
  content: z.string().trim().min(20).max(50000),
  excerpt: z.string().trim().max(500).optional().default(''),
  author_name: z.string().trim().min(2).max(80),
  category: z.string().trim().min(2).max(80).optional().default('Chia sẻ kinh nghiệm'),
}).strict();

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select(PUBLIC_BLOG_SELECT)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ posts: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để gửi bài viết.' },
        { status: 401 },
      );
    }

    const input = createBlogPostSchema.parse(await request.json());
    const slug = `${slugifyBlogTitle(input.title)}-${randomUUID().slice(0, 8)}`;
    const excerpt = input.excerpt || (
      input.content.length > 160 ? `${input.content.slice(0, 160)}...` : input.content
    );
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: input.title,
        slug,
        content: input.content,
        excerpt,
        author_name: input.author_name,
        category: input.category,
        status: 'pending',
        created_by: authData.user.id,
      })
      .select(PUBLIC_BLOG_SELECT)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { post: data, message: 'Bài viết đã được gửi và đang chờ admin duyệt.' },
      { status: 201 },
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Nội dung bài viết chưa hợp lệ hoặc vượt quá giới hạn.' },
        { status: 400 },
      );
    }
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
