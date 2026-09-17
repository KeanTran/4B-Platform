import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}));

import { sendGAEvent } from '@next/third-parties/google';
import {
  ANALYTICS_CONSENT_KEY,
  getAnalyticsConsent,
  setAnalyticsConsent,
  trackEvent,
} from './analytics';

describe('analytics privacy guard', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-TEST123');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not send an event before consent is granted', () => {
    trackEvent('cta_clicked', { location: 'hero' });

    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it('persists a valid analytics preference', () => {
    setAnalyticsConsent('granted');

    expect(window.localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe('granted');
    expect(getAnalyticsConsent()).toBe('granted');
  });

  it('does not send an event when Google Analytics is not configured', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', '');
    setAnalyticsConsent('granted');

    trackEvent('cta_clicked', { location: 'hero' });

    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it('sends allow-listed primitive data and drops sensitive properties', () => {
    setAnalyticsConsent('granted');

    trackEvent('signup_completed', {
      method: 'password',
      session_created: true,
      email: 'do-not-send@example.com',
      user_id: 'private-id',
      empty: undefined,
    });

    expect(sendGAEvent).toHaveBeenCalledWith({
      event: 'signup_completed',
      method: 'password',
      session_created: true,
    });
  });

  it('continues to suppress events after consent is denied', () => {
    setAnalyticsConsent('denied');
    trackEvent('dashboard_guest_started', { entry_path: '/dashboard' });

    expect(sendGAEvent).not.toHaveBeenCalled();
  });
});
