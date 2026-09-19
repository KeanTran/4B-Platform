import { NextRequest, NextResponse } from 'next/server';
import { apiError, PROFILE_PUBLIC_FIELDS } from '@/lib/roommates/api';
import {
  roommateConnectionActionSchema,
  roommateConnectionCreateSchema,
} from '@/lib/roommates/validation';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { RoommateProfile } from '@/types/roommates';

const CONNECTION_FIELDS =
  'id, requester_user_id, recipient_user_id, message, status, created_at, updated_at';

interface ConnectionRow {
  id: string;
  requester_user_id: string;
  recipient_user_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface OwnedProfile extends RoommateProfile {
  user_id: string;
}

async function currentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

function connectionPayload(row: ConnectionRow, userId: string, profile: RoommateProfile) {
  return {
    id: row.id,
    direction: row.recipient_user_id === userId ? 'incoming' : 'outgoing',
    status: row.status,
    message: row.message,
    profile,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('roommate_connections')
      .select(CONNECTION_FIELDS)
      .or(`requester_user_id.eq.${user.id},recipient_user_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as ConnectionRow[];
    const counterpartIds = rows.map((row) =>
      row.requester_user_id === user.id ? row.recipient_user_id : row.requester_user_id,
    );
    if (counterpartIds.length === 0) return NextResponse.json({ connections: [] });

    const profileResult = await admin
      .from('roommate_profiles')
      .select(`user_id, ${PROFILE_PUBLIC_FIELDS}`)
      .in('user_id', counterpartIds);
    if (profileResult.error) throw new Error(profileResult.error.message);

    const profilesByUser = new Map(
      ((profileResult.data ?? []) as OwnedProfile[]).map((profile) => [profile.user_id, profile]),
    );
    const connections = rows.flatMap((row) => {
      const counterpartId = row.requester_user_id === user.id
        ? row.recipient_user_id
        : row.requester_user_id;
      const profile = profilesByUser.get(counterpartId);
      if (!profile) return [];
      const { user_id: _userId, ...publicProfile } = profile;
      return [connectionPayload(row, user.id, publicProfile)];
    });

    return NextResponse.json({ connections });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
    const input = roommateConnectionCreateSchema.parse(await request.json());
    const admin = createAdminClient();

    const [targetResult, ownProfileResult] = await Promise.all([
      admin
        .from('roommate_profiles')
        .select(`user_id, ${PROFILE_PUBLIC_FIELDS}`)
        .eq('id', input.profile_id)
        .eq('is_discoverable', true)
        .maybeSingle<OwnedProfile>(),
      admin
        .from('roommate_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle<{ id: string }>(),
    ]);
    if (targetResult.error || ownProfileResult.error) {
      throw new Error(targetResult.error?.message ?? ownProfileResult.error?.message);
    }
    if (!ownProfileResult.data) {
      return NextResponse.json(
        { error: 'Hãy tạo hồ sơ ở ghép trước khi gửi kết nối.', code: 'PROFILE_REQUIRED' },
        { status: 409 },
      );
    }
    if (!targetResult.data) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ công khai.' }, { status: 404 });
    }
    if (targetResult.data.user_id === user.id) {
      return NextResponse.json({ error: 'Bạn không thể tự kết nối với chính mình.' }, { status: 400 });
    }

    const pair = [user.id, targetResult.data.user_id].sort();
    const existingResult = await admin
      .from('roommate_connections')
      .select(CONNECTION_FIELDS)
      .eq('member_low', pair[0]!)
      .eq('member_high', pair[1]!)
      .maybeSingle<ConnectionRow>();
    if (existingResult.error) throw new Error(existingResult.error.message);
    if (existingResult.data?.status === 'pending') {
      return NextResponse.json({ error: 'Hai bạn đã có một lời mời đang chờ.' }, { status: 409 });
    }
    if (existingResult.data?.status === 'accepted') {
      return NextResponse.json({ error: 'Hai bạn đã kết nối.' }, { status: 409 });
    }

    const values = {
      requester_user_id: user.id,
      recipient_user_id: targetResult.data.user_id,
      message: input.message,
      status: 'pending' as const,
      responded_at: null,
      updated_at: new Date().toISOString(),
    };
    const mutation = existingResult.data
      ? admin
          .from('roommate_connections')
          .update(values)
          .eq('id', existingResult.data.id)
          .eq('status', existingResult.data.status)
      : admin.from('roommate_connections').insert(values);
    const { data, error } = await mutation.select(CONNECTION_FIELDS).single<ConnectionRow>();
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'Hai bạn đã có một kết nối.' }, { status: 409 });
    }
    if (error || !data) throw new Error(error?.message ?? 'Không tạo được lời mời.');

    const { user_id: _targetUserId, ...publicProfile } = targetResult.data;
    return NextResponse.json(
      { connection: connectionPayload(data, user.id, publicProfile) },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
    const input = roommateConnectionActionSchema.parse(await request.json());
    const admin = createAdminClient();
    const { data: connection, error: readError } = await admin
      .from('roommate_connections')
      .select(CONNECTION_FIELDS)
      .eq('id', input.connection_id)
      .maybeSingle<ConnectionRow>();
    if (readError) throw new Error(readError.message);
    if (!connection) return NextResponse.json({ error: 'Không tìm thấy lời mời.' }, { status: 404 });

    const isRequester = connection.requester_user_id === user.id;
    const isRecipient = connection.recipient_user_id === user.id;
    if (!isRequester && !isRecipient) {
      return NextResponse.json({ error: 'Bạn không có quyền thay đổi lời mời này.' }, { status: 403 });
    }

    const recipientAction = input.action === 'accept' || input.action === 'decline';
    if (recipientAction && (!isRecipient || connection.status !== 'pending')) {
      return NextResponse.json({ error: 'Chỉ người nhận mới có thể phản hồi lời mời đang chờ.' }, { status: 403 });
    }
    if (input.action === 'cancel' && (!isRequester || connection.status !== 'pending')) {
      return NextResponse.json({ error: 'Chỉ người gửi mới có thể hủy lời mời đang chờ.' }, { status: 403 });
    }
    if (input.action === 'disconnect' && connection.status !== 'accepted') {
      return NextResponse.json({ error: 'Kết nối này chưa được chấp nhận.' }, { status: 409 });
    }

    const status = input.action === 'accept'
      ? 'accepted'
      : input.action === 'decline'
        ? 'declined'
        : 'cancelled';
    const now = new Date().toISOString();
    const { data, error } = await admin
      .from('roommate_connections')
      .update({ status, responded_at: now, updated_at: now })
      .eq('id', connection.id)
      .eq('status', connection.status)
      .select('id, status, updated_at')
      .single();
    if (error || !data) throw new Error(error?.message ?? 'Không cập nhật được lời mời.');
    return NextResponse.json({ connection: data });
  } catch (error) {
    return apiError(error);
  }
}
