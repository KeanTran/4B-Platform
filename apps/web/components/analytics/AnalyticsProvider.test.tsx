import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => (
    <div data-testid="google-analytics">{gaId}</div>
  ),
  sendGAEvent: vi.fn(),
}));

import { AnalyticsProvider } from './AnalyticsProvider';
import { ANALYTICS_CONSENT_KEY } from '@/lib/analytics';

describe('AnalyticsProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('does not render analytics or consent UI without a valid measurement ID', () => {
    render(<AnalyticsProvider measurementId="invalid" />);

    expect(screen.queryByTestId('google-analytics')).not.toBeInTheDocument();
    expect(screen.queryByText('Giúp 4B tốt hơn mỗi ngày')).not.toBeInTheDocument();
  });

  it('waits for explicit consent before loading Google Analytics', async () => {
    render(<AnalyticsProvider measurementId="G-TEST123" />);

    expect(await screen.findByText('Giúp 4B tốt hơn mỗi ngày')).toBeInTheDocument();
    expect(screen.queryByTestId('google-analytics')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cho phép thống kê' }));

    expect(screen.getByTestId('google-analytics')).toHaveTextContent('G-TEST123');
    expect(window.localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe('granted');
  });

  it('remembers a refusal and keeps analytics unloaded', async () => {
    render(<AnalyticsProvider measurementId="G-TEST123" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Chỉ thiết yếu' }));

    expect(screen.queryByTestId('google-analytics')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe('denied');
  });
});
