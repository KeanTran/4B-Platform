import 'server-only';

import { createHash, randomUUID } from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import {
  createAdminClient,
  isSupabaseAdminConfigured,
} from '@/lib/supabase/admin';
import { AI_PLAN_LIMITS, type AIPlan } from './config';

const AI_GUEST_COOKIE = '4b_ai_guest';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export interface AIUsageSnapshot {
  configured: boolean;
  plan: AIPlan;
  used: number;
  limit: number;
  remaining: number;
  periodStart: string;
}

export interface AIUsageContext {
  subjectHash: string;
  subjectKind: 'guest' | 'user';
  userId: string | null;
  newGuestId: string | null;
}

interface AIUsageRow {
  request_count: number;
}

interface AIPlanRow {
  plan: AIPlan;
}

interface ReservationRow {
  allowed: boolean;
  used_count: number;
  limit_count: number;
  usage_period_start: string;
}

function currentPeriodStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
}

function hashSubject(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function isAIPlan(value: unknown): value is AIPlan {
  return value === 'free' || value === 'pro';
}

async function getAuthenticatedUserId() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.includes('placeholder')) {
    return null;
  }

  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function resolveAIUsageContext(
  request: NextRequest,
): Promise<AIUsageContext> {
  const userId = await getAuthenticatedUserId();

  if (userId) {
    return {
      subjectHash: hashSubject(`user:${userId}`),
      subjectKind: 'user',
      userId,
      newGuestId: null,
    };
  }

  const existingGuestId = request.cookies.get(AI_GUEST_COOKIE)?.value;
  const guestId = existingGuestId || randomUUID();

  return {
    subjectHash: hashSubject(`guest:${guestId}`),
    subjectKind: 'guest',
    userId: null,
    newGuestId: existingGuestId ? null : guestId,
  };
}

export function attachAIGuestCookie(
  response: NextResponse,
  context: AIUsageContext,
) {
  if (!context.newGuestId) return response;

  response.cookies.set(AI_GUEST_COOKIE, context.newGuestId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: ONE_YEAR_SECONDS,
    path: '/',
  });

  return response;
}

async function loadPlan(userId: string | null): Promise<AIPlan> {
  if (!userId) return 'free';

  const { data, error } = await createAdminClient()
    .from('ai_user_plans')
    .select('plan')
    .eq('user_id', userId)
    .maybeSingle<AIPlanRow>();

  if (error) throw new Error('Không thể đọc gói AI hiện tại.');
  return isAIPlan(data?.plan) ? data.plan : 'free';
}

export function getUnconfiguredAIUsage(): AIUsageSnapshot {
  return {
    configured: false,
    plan: 'free',
    used: 0,
    limit: AI_PLAN_LIMITS.free,
    remaining: AI_PLAN_LIMITS.free,
    periodStart: currentPeriodStart(),
  };
}

export async function getAIUsageSnapshot(
  context: AIUsageContext,
): Promise<AIUsageSnapshot> {
  if (!isSupabaseAdminConfigured()) {
    throw new Error('Kho lưu hạn mức AI chưa được cấu hình.');
  }

  const admin = createAdminClient();
  const periodStart = currentPeriodStart();

  const [plan, usageResult] = await Promise.all([
    loadPlan(context.userId),
    admin
      .from('ai_usage_monthly')
      .select('request_count')
      .eq('subject_hash', context.subjectHash)
      .eq('period_start', periodStart)
      .maybeSingle<AIUsageRow>(),
  ]);

  if (usageResult.error) {
    throw new Error('Không thể đọc hạn mức AI hiện tại.');
  }

  const limit = AI_PLAN_LIMITS[plan];
  const used = Math.max(usageResult.data?.request_count ?? 0, 0);

  return {
    configured: true,
    plan,
    used,
    limit,
    remaining: Math.max(limit - used, 0),
    periodStart,
  };
}

export async function reserveAIRequest(
  context: AIUsageContext,
  modelId: string,
) {
  const plan = await loadPlan(context.userId);
  const limit = AI_PLAN_LIMITS[plan];
  const { data, error } = await createAdminClient().rpc('reserve_ai_request', {
    p_subject_hash: context.subjectHash,
    p_subject_kind: context.subjectKind,
    p_plan: plan,
    p_limit: limit,
    p_model_id: modelId,
  });

  if (error) throw new Error('Không thể kiểm tra hạn mức AI.');

  const reservation = (data as ReservationRow[] | null)?.[0];
  if (!reservation) throw new Error('Không nhận được trạng thái hạn mức AI.');

  const used = Math.max(reservation.used_count, 0);
  return {
    allowed: reservation.allowed,
    usage: {
      configured: true,
      plan,
      used,
      limit: reservation.limit_count,
      remaining: Math.max(reservation.limit_count - used, 0),
      periodStart: reservation.usage_period_start,
    } satisfies AIUsageSnapshot,
  };
}

export async function recordAITokenUsage(
  subjectHash: string,
  inputTokens: number,
  outputTokens: number,
) {
  const { error } = await createAdminClient().rpc('record_ai_token_usage', {
    p_subject_hash: subjectHash,
    p_input_tokens: Math.max(inputTokens, 0),
    p_output_tokens: Math.max(outputTokens, 0),
  });

  if (error) throw new Error('Không thể ghi nhận token AI.');
}

export async function releaseAIRequest(subjectHash: string) {
  const { error } = await createAdminClient().rpc('release_ai_request', {
    p_subject_hash: subjectHash,
  });

  if (error) throw new Error('Không thể hoàn lại lượt AI.');
}
