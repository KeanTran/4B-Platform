import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

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
    const body = await request.json();
    const { title, content, excerpt, author_name, category } = body;

    if (!title?.trim() || !content?.trim() || !author_name?.trim()) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ tiêu đề, nội dung và tên tác giả' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([
        {
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt?.trim() || (content.trim().length > 150 ? content.trim().slice(0, 150) + '...' : content.trim()),
          author_name: author_name.trim(),
          category: category?.trim() || 'Chia sẻ kinh nghiệm',
          is_published: true,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
