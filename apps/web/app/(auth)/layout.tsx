import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckCircle2, Sparkles, UsersRound } from 'lucide-react';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg-light)' }}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full blur-3xl"
        style={{ background: 'rgba(212, 238, 125, 0.28)' }}
      />
      <div className="relative grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <aside
          className="relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14"
          style={{ background: 'var(--gradient-dark)' }}
        >
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10 bg-white/5"
          />
          <Link href="/" className="relative inline-flex items-center gap-3 no-underline">
            <BrandLogo height={42} />
            <span className="brand-font text-xl font-extrabold text-white">For Better Balance</span>
          </Link>

          <div className="relative max-w-xl py-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-[var(--primary-light)]">
              <Sparkles size={14} aria-hidden="true" />
              Không gian chung, nhẹ đầu hơn
            </span>
            <h1 className="brand-font mt-5 text-4xl font-extrabold leading-tight xl:text-5xl">
              Cân bằng chuyện tiền bạc, việc nhà và cuộc sống ở ghép.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/70">
              Bắt đầu miễn phí, mời bạn cùng phòng và để 4B giúp mọi người giữ mọi thứ rõ ràng mà vẫn gần gũi.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                'Dashboard dùng ngay',
                'Chia tiền minh bạch',
                'Lịch việc nhà rõ ràng',
                'AI hỗ trợ khi cần',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-white/80">
                  <CheckCircle2 size={16} className="text-[var(--primary-light)]" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary-dark)]">
              <UsersRound size={19} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold">Thiết kế cho những người đang sống cùng nhau</p>
              <p className="mt-0.5 text-xs text-white/60">Rõ ràng hơn mà không làm mất đi sự thoải mái.</p>
            </div>
          </div>
        </aside>

        <main className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-10">
          <ThemeToggle className="absolute right-4 top-4 sm:right-6 sm:top-6" />
          <div className="w-full max-w-[500px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
