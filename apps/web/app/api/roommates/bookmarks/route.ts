import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/roommates/api';
import { roommateBookmarkSchema } from '@/lib/roommates/validation';
import { createClient } from '@/lib/supabase/server';

async function authenticatedClient() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}

export async function GET() {
  try {
    const { supabase, user } = await authenticatedClient();
    if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
    const { data, error } = await supabase
      .from('roommate_bookmarks')
      .select('profile_id, post_id')
      .eq('user_id', user.id);
    if (error) throw new Error(error.message);
    return NextResponse.json({
      profile_ids: (data ?? []).flatMap((item) => (item.profile_id ? [item.profile_id] : [])),
      post_ids: (data ?? []).flatMap((item) => (item.post_id ? [item.post_id] : [])),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await authenticatedClient();
    if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
    const input = roommateBookmarkSchema.parse(await request.json());
    const target = input.target === 'profile' ? { profile_id: input.target_id } : { post_id: input.target_id };
    const { error } = await supabase
      .from('roommate_bookmarks')
      .insert({ user_id: user.id, ...target });
    if (error && error.code !== '23505') throw new Error(error.message);
    return NextResponse.json({ saved: true }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { supabase, user } = await authenticatedClient();
    if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
    const input = roommateBookmarkSchema.parse(await request.json());
    const column = input.target === 'profile' ? 'profile_id' : 'post_id';
    const { error } = await supabase
      .from('roommate_bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq(column, input.target_id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ saved: false });
  } catch (error) {
    return apiError(error);
  }
}
