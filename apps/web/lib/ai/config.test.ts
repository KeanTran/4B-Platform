import { afterEach, describe, expect, it } from 'vitest';
import { getAIProvider, isAIProviderConfigured } from './config';

const ORIGINAL_ENV = { ...process.env };

describe('AI Gateway configuration', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('accepts a static AI Gateway API key', () => {
    delete process.env.GROQ_API_KEY;
    delete process.env.VERCEL_OIDC_TOKEN;
    delete process.env.VERCEL;
    process.env.AI_GATEWAY_API_KEY = 'test-key';

    expect(isAIProviderConfigured()).toBe(true);
  });

  it('accepts an OIDC token pulled for local development', () => {
    delete process.env.GROQ_API_KEY;
    delete process.env.AI_GATEWAY_API_KEY;
    delete process.env.VERCEL;
    process.env.VERCEL_OIDC_TOKEN = 'test-oidc-token';

    expect(isAIProviderConfigured()).toBe(true);
  });

  it('accepts the managed Vercel runtime', () => {
    delete process.env.GROQ_API_KEY;
    delete process.env.AI_GATEWAY_API_KEY;
    delete process.env.VERCEL_OIDC_TOKEN;
    process.env.VERCEL = '1';

    expect(isAIProviderConfigured()).toBe(true);
  });

  it('stays disabled without a supported server credential', () => {
    delete process.env.GROQ_API_KEY;
    delete process.env.AI_GATEWAY_API_KEY;
    delete process.env.VERCEL_OIDC_TOKEN;
    delete process.env.VERCEL;

    expect(isAIProviderConfigured()).toBe(false);
  });

  it('prefers the existing Groq credential over AI Gateway', () => {
    process.env.GROQ_API_KEY = 'test-groq-key';
    process.env.AI_GATEWAY_API_KEY = 'test-gateway-key';

    expect(isAIProviderConfigured()).toBe(true);
    expect(getAIProvider()).toMatchObject({
      modelId: 'openai/gpt-oss-120b',
      provider: 'groq',
    });
  });
});
