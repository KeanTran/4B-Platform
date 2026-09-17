'use client';

import { sendGAEvent } from '@next/third-parties/google';

export const ANALYTICS_CONSENT_KEY = '4b-analytics-consent-v1';

export type AnalyticsConsent = 'granted' | 'denied';

export type AnalyticsEventName =
  | 'cta_clicked'
  | 'dashboard_guest_started'
  | 'demo_opened'
  | 'login_completed'
  | 'signup_completed'
  | 'split_completed'
  | 'upgrade_clicked';

type AnalyticsValue = string | number | boolean;
type AnalyticsProperties = Record<string, AnalyticsValue | null | undefined>;

const SENSITIVE_PROPERTY_PATTERN =
  /(^|_)(email|name|phone|password|address|message|content|user_id|member_id)($|_)/i;

export function isValidAnalyticsMeasurementId(value?: string): value is string {
  return Boolean(value && /^G-[A-Z0-9]+$/i.test(value));
}

export function getAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === 'undefined') return null;

  const consent = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  return consent === 'granted' || consent === 'denied' ? consent : null;
}

export function setAnalyticsConsent(consent: AnalyticsConsent) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, consent);
}

export function trackEvent(
  event: AnalyticsEventName,
  properties: AnalyticsProperties = {},
) {
  if (
    typeof window === 'undefined' ||
    getAnalyticsConsent() !== 'granted' ||
    !isValidAnalyticsMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
  ) {
    return;
  }

  const safeProperties = Object.fromEntries(
    Object.entries(properties).filter(
      ([key, value]) =>
        !SENSITIVE_PROPERTY_PATTERN.test(key) &&
        value !== null &&
        value !== undefined,
    ),
  );

  sendGAEvent({ event, ...safeProperties });
}
