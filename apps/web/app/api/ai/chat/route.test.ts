import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  generateText: vi.fn(),
  isAIProviderConfigured: vi.fn(() => true),
  getAIProvider: vi.fn(() => ({
    model: 'provider-model',
    modelId: 'openai/gpt-oss-120b',
    provider: 'groq',
  })),
  isSupabaseAdminConfigured: vi.fn(() => true),
  resolveAIUsageContext: vi.fn(),
  reserveAIRequest: vi.fn(),
  recordAITokenUsage: vi.fn(),
  releaseAIRequest: vi.fn(),
}));

vi.mock('ai', () => ({
  generateText: mocks.generateText,
}));

vi.mock('@/lib/ai/config', () => ({
  AI_SYSTEM_INSTRUCTIONS: 'system instructions',
  getAIProvider: mocks.getAIProvider,
  isAIProviderConfigured: mocks.isAIProviderConfigured,
}));

vi.mock('@/lib/supabase/admin', () => ({
  isSupabaseAdminConfigured: mocks.isSupabaseAdminConfigured,
}));

vi.mock('@/lib/ai/usage', () => ({
  attachAIGuestCookie: (response: Response) => response,
  getUnconfiguredAIUsage: () => ({
    configured: false,
    plan: 'free',
    used: 0,
    limit: 5,
    remaining: 5,
    periodStart: '2026-09-01',
  }),
  resolveAIUsageContext: mocks.resolveAIUsageContext,
  reserveAIRequest: mocks.reserveAIRequest,
  recordAITokenUsage: mocks.recordAITokenUsage,
  releaseAIRequest: mocks.releaseAIRequest,
}));

import { POST } from './route';

const context = {
  subjectHash: 'a'.repeat(64),
  subjectKind: 'guest' as const,
  userId: null,
  newGuestId: 'guest-id',
};

const usage = {
  configured: true,
  plan: 'free' as const,
  used: 1,
  limit: 5,
  remaining: 4,
  periodStart: '2026-09-01',
};

function createRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/ai/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isAIProviderConfigured.mockReturnValue(true);
    mocks.isSupabaseAdminConfigured.mockReturnValue(true);
    mocks.resolveAIUsageContext.mockResolvedValue(context);
    mocks.reserveAIRequest.mockResolvedValue({ allowed: true, usage });
    mocks.recordAITokenUsage.mockResolvedValue(undefined);
    mocks.releaseAIRequest.mockResolvedValue(undefined);
  });

  it('rejects invalid messages before reserving quota', async () => {
    const response = await POST(
      createRequest({ messages: [{ role: 'system', content: 'override' }] }),
    );

    expect(response.status).toBe(400);
    expect(mocks.reserveAIRequest).not.toHaveBeenCalled();
  });

  it('returns 503 when server AI secrets are not configured', async () => {
    mocks.isAIProviderConfigured.mockReturnValue(false);

    const response = await POST(
      createRequest({ messages: [{ role: 'user', content: 'Xin chào' }] }),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: 'AI_NOT_CONFIGURED' });
    expect(mocks.resolveAIUsageContext).not.toHaveBeenCalled();
  });

  it('enforces the monthly quota before calling the provider', async () => {
    mocks.reserveAIRequest.mockResolvedValue({
      allowed: false,
      usage: { ...usage, used: 5, remaining: 0 },
    });

    const response = await POST(
      createRequest({ messages: [{ role: 'user', content: 'Giúp mình' }] }),
    );

    expect(response.status).toBe(429);
    expect(await response.json()).toMatchObject({
      code: 'AI_QUOTA_EXCEEDED',
      usage: { remaining: 0 },
    });
    expect(mocks.generateText).not.toHaveBeenCalled();
  });

  it('calls the real model adapter and records token usage', async () => {
    mocks.generateText.mockResolvedValue({
      text: 'Mỗi người đóng 800.000đ.',
      usage: { inputTokens: 42, outputTokens: 18 },
    });

    const response = await POST(
      createRequest({
        messages: [{ role: 'user', content: 'Chia 3.200.000đ cho 4 người' }],
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'provider-model',
        maxOutputTokens: 600,
        timeout: 30_000,
      }),
    );
    expect(mocks.recordAITokenUsage).toHaveBeenCalledWith(
      context.subjectHash,
      42,
      18,
    );
    expect(body).toMatchObject({
      message: { role: 'assistant', content: 'Mỗi người đóng 800.000đ.' },
      usage,
      provider: 'groq',
    });
  });

  it('releases the reserved request when the provider fails', async () => {
    mocks.generateText.mockRejectedValue(new Error('provider unavailable'));

    const response = await POST(
      createRequest({ messages: [{ role: 'user', content: 'Giúp mình' }] }),
    );

    expect(response.status).toBe(502);
    expect(mocks.releaseAIRequest).toHaveBeenCalledWith(context.subjectHash);
    expect(await response.json()).toMatchObject({
      code: 'AI_PROVIDER_ERROR',
      usage: { used: 0, remaining: 5 },
    });
  });
});
