import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  AI_SYSTEM_INSTRUCTIONS,
  getAIProvider,
  isAIProviderConfigured,
} from '@/lib/ai/config';
import {
  attachAIGuestCookie,
  getUnconfiguredAIUsage,
  recordAITokenUsage,
  releaseAIRequest,
  reserveAIRequest,
  resolveAIUsageContext,
} from '@/lib/ai/usage';
import { isSupabaseAdminConfigured } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const maxDuration = 45;

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(2_000),
});

const chatRequestSchema = z
  .object({
    messages: z.array(messageSchema).min(1).max(10),
  })
  .superRefine(({ messages }, context) => {
    const totalLength = messages.reduce(
      (sum, message) => sum + message.content.length,
      0,
    );

    if (totalLength > 12_000) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nội dung cuộc trò chuyện quá dài.',
        path: ['messages'],
      });
    }

    if (messages.at(-1)?.role !== 'user') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tin nhắn cuối cùng phải đến từ người dùng.',
        path: ['messages'],
      });
    }
  });

function jsonError(
  status: number,
  code: string,
  error: string,
  usage = getUnconfiguredAIUsage(),
) {
  return NextResponse.json({ code, error, usage }, { status });
}

export async function POST(request: NextRequest) {
  if (!isSupabaseAdminConfigured() || !isAIProviderConfigured()) {
    return jsonError(
      503,
      'AI_NOT_CONFIGURED',
      'AI đang được cấu hình. Vui lòng thử lại sau.',
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError(400, 'INVALID_REQUEST', 'Dữ liệu gửi lên không hợp lệ.');
  }

  const parsed = chatRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(
      400,
      'INVALID_REQUEST',
      parsed.error.issues[0]?.message || 'Dữ liệu gửi lên không hợp lệ.',
    );
  }

  const context = await resolveAIUsageContext(request);
  const provider = getAIProvider();

  try {
    const reservation = await reserveAIRequest(context, provider.modelId);

    if (!reservation.allowed) {
      return attachAIGuestCookie(
        jsonError(
          429,
          'AI_QUOTA_EXCEEDED',
          'Bạn đã dùng hết lượt AI trong tháng này.',
          reservation.usage,
        ),
        context,
      );
    }

    try {
      const result = await generateText({
        model: provider.model,
        instructions: AI_SYSTEM_INSTRUCTIONS,
        messages: parsed.data.messages,
        maxOutputTokens: 600,
        timeout: 30_000,
      });

      await recordAITokenUsage(
        context.subjectHash,
        result.usage.inputTokens ?? 0,
        result.usage.outputTokens ?? 0,
      );

      return attachAIGuestCookie(
        NextResponse.json({
          message: {
            id: crypto.randomUUID(),
            role: 'assistant' as const,
            content: result.text,
          },
          model: provider.modelId,
          provider: provider.provider,
          usage: reservation.usage,
        }),
        context,
      );
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('AI provider request failed', {
          modelId: provider.modelId,
          provider: provider.provider,
          errorName: error instanceof Error ? error.name : 'UnknownError',
        });
      }
      await releaseAIRequest(context.subjectHash).catch(() => undefined);
      return attachAIGuestCookie(
        jsonError(
          502,
          'AI_PROVIDER_ERROR',
          'AI chưa thể phản hồi lúc này. Lượt dùng của bạn không bị trừ.',
          {
            ...reservation.usage,
            used: Math.max(reservation.usage.used - 1, 0),
            remaining: Math.min(
              reservation.usage.remaining + 1,
              reservation.usage.limit,
            ),
          },
        ),
        context,
      );
    }
  } catch {
    return attachAIGuestCookie(
      jsonError(
        503,
        'AI_USAGE_UNAVAILABLE',
        'Chưa thể kiểm tra lượt AI. Vui lòng thử lại sau.',
      ),
      context,
    );
  }
}
