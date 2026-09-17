'use client';

import { useEffect, useState } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import {
  getAnalyticsConsent,
  isValidAnalyticsMeasurementId,
  setAnalyticsConsent,
  type AnalyticsConsent,
} from '@/lib/analytics';

interface AnalyticsProviderProps {
  measurementId?: string;
}

export function AnalyticsProvider({
  measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
}: AnalyticsProviderProps) {
  const [consent, setConsent] = useState<AnalyticsConsent | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(getAnalyticsConsent());
    setReady(true);
  }, []);

  if (!isValidAnalyticsMeasurementId(measurementId) || !ready) {
    return null;
  }

  const updateConsent = (nextConsent: AnalyticsConsent) => {
    setAnalyticsConsent(nextConsent);
    setConsent(nextConsent);
  };

  return (
    <>
      {consent === 'granted' && <GoogleAnalytics gaId={measurementId} />}

      {consent === null && (
        <section
          aria-labelledby="analytics-consent-title"
          aria-live="polite"
          className="glass-surface-strong fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-[var(--radius-xl)] border p-4 shadow-[var(--shadow-glass)] sm:bottom-5 sm:flex sm:items-center sm:gap-5 sm:p-5"
        >
          <div className="min-w-0 flex-1">
            <p
              id="analytics-consent-title"
              className="brand-font text-sm font-bold"
              style={{ color: 'var(--text-heading)' }}
            >
              Giúp 4B tốt hơn mỗi ngày
            </p>
            <p className="mt-1 text-xs leading-relaxed sm:text-sm" style={{ color: 'var(--text-muted)' }}>
              4B dùng Google Analytics để hiểu các tính năng được quan tâm. Chúng tôi không gửi
              tên, email hay nội dung bạn nhập và chỉ kích hoạt sau khi bạn đồng ý.
            </p>
          </div>
          <div className="mt-4 flex shrink-0 flex-col-reverse gap-2 min-[420px]:flex-row sm:mt-0">
            <button
              type="button"
              onClick={() => updateConsent('denied')}
              className="rounded-full border px-4 py-2 text-xs font-bold transition-colors hover:bg-[var(--glass-highlight)]"
              style={{ borderColor: 'var(--glass-border)', color: 'var(--text-main)' }}
            >
              Chỉ thiết yếu
            </button>
            <button
              type="button"
              onClick={() => updateConsent('granted')}
              className="rounded-full px-4 py-2 text-xs font-bold text-white shadow-[var(--shadow-brand-sm)] transition-transform hover:-translate-y-0.5"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Cho phép thống kê
            </button>
          </div>
        </section>
      )}
    </>
  );
}
