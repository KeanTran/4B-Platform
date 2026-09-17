'use client';

import Link from 'next/link';
import { ArrowRight, Check, Sparkles, Users, WalletCards } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { trackEvent } from '@/lib/analytics';

const BENEFITS = [
  'Dùng ngay không cần đăng nhập',
  'Không cần thẻ tín dụng',
  'Nâng cấp Pro khi thật sự cần',
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-[5%] pb-16 pt-32 sm:pt-36 lg:pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-24 h-72 w-72 rounded-full blur-3xl"
        style={{ background: 'rgba(212, 238, 125, 0.32)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-12 h-80 w-80 rounded-full blur-3xl"
        style={{ background: 'rgba(249, 162, 61, 0.16)' }}
      />

      <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[1.04fr_0.96fr]">
        <div>
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold sm:text-sm"
            style={{
              background: 'var(--glass-surface)',
              borderColor: 'var(--glass-border-accent)',
              color: 'var(--primary-dark)',
            }}
          >
            <Sparkles size={16} aria-hidden="true" />
            4B · For Better Balance
          </div>

          <h1
            className="brand-font max-w-3xl text-[38px] font-extrabold leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-[58px]"
            style={{ color: 'var(--text-heading)' }}
          >
            Ở ghép vui hơn khi mọi thứ{' '}
            <span className="gradient-text">rõ ràng và cân bằng.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 sm:text-lg" style={{ color: 'var(--text-muted)' }}>
            Một nơi để cả phòng cùng chia tiền, theo dõi việc nhà, tạo VietQR và nhờ AI gỡ rối
            những tình huống khó nói — nhẹ nhàng như đang dùng một ứng dụng mua sắm quen thuộc.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="group justify-center">
              <Link
                href="/dashboard"
                onClick={() => trackEvent('cta_clicked', { location: 'hero', destination: 'dashboard' })}
              >
                Dùng Dashboard miễn phí
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link
                href="#pricing"
                onClick={() => trackEvent('cta_clicked', { location: 'hero', destination: 'pricing' })}
              >
                Khám phá gói Pro
              </Link>
            </Button>
          </div>

          <ul className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-5">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2 text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
                >
                  <Check size={12} strokeWidth={3} />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <Card variant="glass-strong" className="relative overflow-hidden p-3 sm:p-4">
          <div
            className="rounded-[22px] border p-4 sm:p-5"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>
                  Không gian dùng thử
                </p>
                <p className="brand-font mt-1 font-bold" style={{ color: 'var(--text-heading)' }}>
                  Phòng của Minh & bạn bè
                </p>
              </div>
              <span
                className="rounded-full px-3 py-1 text-[11px] font-bold"
                style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}
              >
                Free
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4" style={{ background: 'var(--color-bg-soft-primary)' }}>
                <WalletCards size={20} style={{ color: 'var(--primary)' }} />
                <p className="mt-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>Chi phí tháng này</p>
                <p className="brand-font mt-1 text-xl font-extrabold" style={{ color: 'var(--text-heading)' }}>
                  4,8 triệu
                </p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'var(--accent-light)' }}>
                <Users size={20} style={{ color: 'var(--accent)' }} />
                <p className="mt-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>Đã thanh toán</p>
                <p className="brand-font mt-1 text-xl font-extrabold" style={{ color: 'var(--text-heading)' }}>
                  3 / 4
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {[
                { label: 'Tiền nhà', amount: '3.200.000đ', status: 'Đã chia' },
                { label: 'Điện, nước', amount: '1.120.000đ', status: 'Đã chia' },
                { label: 'Internet', amount: '480.000đ', status: 'Chờ thu' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-light)' }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold" style={{ color: 'var(--text-main)' }}>{item.label}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.status}</p>
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-heading)' }}>{item.amount}</span>
                </div>
              ))}
            </div>

            <div
              className="mt-3 flex items-start gap-3 rounded-2xl border p-3"
              style={{ background: 'var(--gradient-soft-success)', borderColor: 'var(--glass-border-accent)' }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                <Sparkles size={17} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold" style={{ color: 'var(--text-heading)' }}>Gợi ý từ 4B AI</p>
                  <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[9px] font-extrabold text-white">PRO</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Chia điện nước theo số ngày ở sẽ công bằng hơn cho phòng bạn tháng này.
                </p>
              </div>
            </div>

            <Button asChild className="mt-4 w-full">
              <Link
                href="/dashboard"
                onClick={() => trackEvent('cta_clicked', { location: 'hero_preview', destination: 'dashboard' })}
              >
                Mở không gian của bạn
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
