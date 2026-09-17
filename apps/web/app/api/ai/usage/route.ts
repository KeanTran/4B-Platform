import { NextRequest, NextResponse } from 'next/server';
import { isAIProviderConfigured } from '@/lib/ai/config';
import {
  attachAIGuestCookie,
  getAIUsageSnapshot,
  getUnconfiguredAIUsage,
  resolveAIUsageContext,
} from '@/lib/ai/usage';
import { isSupabaseAdminConfigured } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      {
        code: 'AI_NOT_CONFIGURED',
        error: 'Kho lưu hạn mức AI chưa được cấu hình.',
        usage: getUnconfiguredAIUsage(),
      },
      { status: 503 },
    );
  }

  const context = await resolveAIUsageContext(request);

  try {
    const usage = await getAIUsageSnapshot(context);
    return attachAIGuestCookie(
      NextResponse.json({
        usage: { ...usage, configured: isAIProviderConfigured() },
      }),
      context,
    );
  } catch {
    return attachAIGuestCookie(
      NextResponse.json(
        {
          code: 'AI_USAGE_UNAVAILABLE',
          error: 'Chưa thể đọc lượt AI hiện tại.',
          usage: getUnconfiguredAIUsage(),
        },
        { status: 503 },
      ),
      context,
    );
  }
}
