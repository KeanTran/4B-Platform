import { NextRequest, NextResponse } from 'next/server';
import { apiError, PROFILE_PUBLIC_FIELDS, queryLimit } from '@/lib/roommates/api';
import { roommateProfileSchema } from '@/lib/roommates/validation';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const params = request.nextUrl.searchParams;
    let query = supabase
      .from('roommate_profiles')
      .select(PROFILE_PUBLIC_FIELDS)
      .eq('is_discoverable', true)
      .order('updated_at', { ascending: false })
      .limit(queryLimit(params.get('limit')));

    const city = params.get('city')?.trim();
    const district = params.get('district')?.trim();
    const budgetMinValue = params.get('budget_min');
    const budgetMaxValue = params.get('budget_max');
    const moveInDaysValue = params.get('move_in_days');
    const budgetMin = budgetMinValue === null ? null : Number(budgetMinValue);
    const budgetMax = budgetMaxValue === null ? null : Number(budgetMaxValue);
    const moveInDays = moveInDaysValue === null ? null : Number(moveInDaysValue);
    if (city) query = query.ilike('city', `%${city}%`);
    if (district) query = query.ilike('district', `%${district}%`);
    if (budgetMin !== null && Number.isFinite(budgetMin) && budgetMin >= 0) query = query.gte('budget_max', budgetMin);
    if (budgetMax !== null && Number.isFinite(budgetMax) && budgetMax >= 0) query = query.lte('budget_min', budgetMax);
    if (moveInDays !== null && Number.isInteger(moveInDays) && moveInDays >= 1 && moveInDays <= 365) {
      const today = new Date();
      const deadline = new Date(today);
      deadline.setUTCDate(deadline.getUTCDate() + moveInDays);
      query = query
        .gte('move_in_date', today.toISOString().slice(0, 10))
        .lte('move_in_date', deadline.toISOString().slice(0, 10));
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return NextResponse.json({ profiles: data ?? [] });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để tạo hồ sơ.' }, { status: 401 });
    }

    const input = roommateProfileSchema.parse(await request.json());
    const { data, error } = await supabase
      .from('roommate_profiles')
      .upsert({ ...input, user_id: authData.user.id, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      .select(PROFILE_PUBLIC_FIELDS)
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ profile: data }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
