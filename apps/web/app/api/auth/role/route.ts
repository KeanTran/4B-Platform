import { NextResponse } from 'next/server';
import { getCurrentUserAccess } from '@/lib/auth/roles';

export async function GET() {
  try {
    const access = await getCurrentUserAccess();
    if (!access.userId) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 });
    }
    return NextResponse.json({ role: access.role });
  } catch {
    return NextResponse.json({ error: 'Không thể kiểm tra quyền truy cập.' }, { status: 503 });
  }
}

