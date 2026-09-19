import { NextRequest, NextResponse } from 'next/server';
import { apiError, POST_PUBLIC_FIELDS, queryLimit } from '@/lib/roommates/api';
import { roommatePostSchema } from '@/lib/roommates/validation';
import { createClient } from '@/lib/supabase/server';

function authorName(user: { email?: string; user_metadata?: Record<string, unknown> }) {
  const metadataName = user.user_metadata?.full_name;
  if (typeof metadataName === 'string' && metadataName.trim().length >= 2) {
    return metadataName.trim().slice(0, 80);
  }
  const emailName = user.email?.split('@')[0]?.trim();
  return emailName && emailName.length >= 2 ? emailName.slice(0, 80) : 'Thành viên 4B';
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const params = request.nextUrl.searchParams;
    let query = supabase
      .from('roommate_posts')
      .select(POST_PUBLIC_FIELDS)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(queryLimit(params.get('limit')));

    const search = params.get('search')?.trim();
    const city = params.get('city')?.trim();
    const district = params.get('district')?.trim();
    if (search) query = query.ilike('title', `%${search}%`);
    if (city) query = query.ilike('city', `%${city}%`);
    if (district) query = query.ilike('district', `%${district}%`);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return NextResponse.json({ posts: data ?? [] });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để đăng bài.' }, { status: 401 });
    }

    const input = roommatePostSchema.parse(await request.json());
    const { data, error } = await supabase
      .from('roommate_posts')
      .insert({
        ...input,
        author_id: authData.user.id,
        author_name: authorName(authData.user),
        status: 'published',
      })
      .select(POST_PUBLIC_FIELDS)
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

