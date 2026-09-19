'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  HeartHandshake,
  LayoutDashboard,
  Newspaper,
  QrCode,
  ReceiptText,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const QUICK_ACTIONS = [
  {
    title: 'Tổng Quan Thu Chi',
    description: 'Theo dõi tổng chi, khoản đã thu và số tiền còn thiếu.',
    href: '/dashboard',
    icon: LayoutDashboard,
    tone: 'primary',
  },
  {
    title: 'Chia Tiền Nâng Cao',
    description: 'Chia đều, theo tỷ lệ hoặc theo số ngày ở.',
    href: '/dashboard/split',
    icon: ReceiptText,
    tone: 'accent',
  },
  {
    title: 'Lịch Trực Nhật',
    description: 'Phân công và theo dõi công việc trong phòng.',
    href: '/dashboard/duties',
    icon: CalendarCheck2,
    tone: 'primary',
  },
  {
    title: '4B Student Pro AI',
    description: 'AI hỗ trợ cuộc sống ở ghép với hạn mức Free.',
    href: '/dashboard/ai',
    icon: Bot,
    tone: 'dark',
  },
] as const;

const TONE_STYLES = {
  primary: {
    background: 'var(--color-bg-soft-primary)',
    color: 'var(--primary)',
  },
  accent: {
    background: 'var(--accent-light)',
    color: 'var(--accent)',
  },
  dark: {
    background: 'var(--dark)',
    color: 'var(--warning)',
  },
} as const;

const MEMBERS = [
  { name: 'Minh', initials: 'M', color: 'var(--primary)' },
  { name: 'An', initials: 'A', color: 'var(--accent)' },
  { name: 'Hà', initials: 'H', color: 'var(--dark)' },
  { name: 'Linh', initials: 'L', color: '#5f7fd6' },
] as const;

export function HomeHub() {
  return (
    <section className="relative min-h-screen overflow-hidden px-[4%] pb-10 pt-24 sm:pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-16 h-80 w-80 rounded-full blur-3xl"
        style={{ background: 'rgba(212, 238, 125, 0.3)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-36 h-72 w-72 rounded-full blur-3xl"
        style={{ background: 'rgba(249, 162, 61, 0.14)' }}
      />

      <div className="relative mx-auto max-w-[1440px]">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div
              className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold"
              style={{
                background: 'var(--glass-surface)',
                borderColor: 'var(--glass-border-accent)',
                color: 'var(--primary-dark)',
              }}
            >
              <Sparkles size={14} aria-hidden="true" />
              4B · For Better Balance
            </div>
            <h1
              className="brand-font text-3xl font-extrabold leading-tight tracking-[-0.03em] sm:text-4xl lg:text-[46px]"
              style={{ color: 'var(--text-heading)' }}
            >
              Ở ghép vui hơn khi mọi thứ{' '}
              <span className="gradient-text">rõ ràng và cân bằng.</span>
            </h1>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild size="lg">
              <Link
                href="/dashboard"
                prefetch
                onClick={() =>
                  trackEvent('cta_clicked', {
                    location: 'home_hub_header',
                    destination: 'dashboard',
                  })
                }
              >
                Dùng Dashboard miễn phí
                <ArrowRight size={17} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing" prefetch>Khám phá gói Pro</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.6fr)]">
          <Card variant="glass-strong" className="overflow-hidden p-3 sm:p-4">
            <div
              className="h-full rounded-[22px] border p-4 sm:p-5"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: 'var(--primary)' }}>
                    Bộ công cụ 4B
                  </p>
                  <h2 className="brand-font mt-1 text-xl font-extrabold sm:text-2xl" style={{ color: 'var(--text-heading)' }}>
                    Chọn đúng công cụ cho việc đang làm
                  </h2>
                </div>
                <Link
                  href="/product"
                  className="inline-flex items-center gap-2 text-sm font-bold no-underline"
                  style={{ color: 'var(--primary)' }}
                >
                  Xem toàn bộ
                  <ArrowUpRight size={16} />
                </Link>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  const tone = TONE_STYLES[action.tone];

                  return (
                    <Link
                      key={action.title}
                      href={action.href}
                      prefetch
                      onClick={() =>
                        trackEvent('cta_clicked', {
                          location: 'home_hub_tool',
                          destination: action.href,
                        })
                      }
                      className="interactive-lift group flex min-h-32 items-start gap-4 rounded-2xl border p-4 no-underline"
                      style={{ background: 'var(--bg-light)', borderColor: 'var(--border)' }}
                    >
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                        style={tone}
                      >
                        <Icon size={21} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-3">
                          <span className="brand-font text-base font-bold" style={{ color: 'var(--text-heading)' }}>
                            {action.title}
                          </span>
                          <ArrowUpRight
                            size={15}
                            className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            style={{ color: 'var(--primary)' }}
                          />
                        </span>
                        <span className="mt-2 block text-xs leading-5" style={{ color: 'var(--text-muted)' }}>
                          {action.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card variant="glass" className="flex flex-col overflow-hidden p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: 'var(--primary)' }}>
                  Dashboard phòng
                </p>
                <h2 className="brand-font mt-1 text-xl font-extrabold" style={{ color: 'var(--text-heading)' }}>
                  Tổng Quan Thu Chi
                </h2>
              </div>
              <span
                className="rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide"
                style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}
              >
                Free
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4" style={{ background: 'var(--color-bg-soft-primary)' }}>
                <CircleDollarSign size={20} style={{ color: 'var(--primary)' }} />
                <p className="mt-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  Tổng Chi Phí
                </p>
                <p className="brand-font mt-1 text-xl font-extrabold" style={{ color: 'var(--text-heading)' }}>
                  4.800.000đ
                </p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'var(--accent-light)' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--accent)' }} />
                <p className="mt-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  Đã Thanh Toán
                </p>
                <p className="brand-font mt-1 text-xl font-extrabold" style={{ color: 'var(--text-heading)' }}>
                  3 / 4
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>
                  Thành Viên
                </p>
                <span className="text-xs font-bold" style={{ color: 'var(--danger)' }}>
                  Chưa Thanh Toán
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex -space-x-2" aria-label="4 thành viên">
                  {MEMBERS.map((member) => (
                    <span
                      key={member.name}
                      title={member.name}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-extrabold text-white"
                      style={{ background: member.color, borderColor: 'var(--surface)' }}
                    >
                      {member.initials}
                    </span>
                  ))}
                </div>
                <span className="brand-font text-lg font-extrabold" style={{ color: 'var(--danger)' }}>
                  480.000đ
                </span>
              </div>
            </div>

            <Button asChild className="mt-4 w-full">
              <Link href="/dashboard">
                Mở Dashboard
                <ArrowRight size={16} />
              </Link>
            </Button>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/roommates" prefetch className="group no-underline">
            <Card variant="surface" className="interactive-lift flex h-full items-center gap-4 p-5">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
              >
                <HeartHandshake size={23} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: 'var(--primary)' }}>
                  Kết nối phù hợp
                </span>
                <span className="brand-font mt-1 block text-base font-bold" style={{ color: 'var(--text-heading)' }}>
                  Tìm Bạn Ở Ghép
                </span>
              </span>
              <ArrowUpRight size={17} style={{ color: 'var(--primary)' }} />
            </Card>
          </Link>

          <Link href="/blog" prefetch className="group no-underline">
            <Card variant="surface" className="interactive-lift flex h-full items-center gap-4 p-5">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
              >
                <Newspaper size={23} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: 'var(--primary)' }}>
                  Cộng Đồng 4B
                </span>
                <span className="brand-font mt-1 block text-base font-bold" style={{ color: 'var(--text-heading)' }}>
                  Góc Chia Sẻ & Kinh Nghiệm
                </span>
              </span>
              <ArrowUpRight size={17} style={{ color: 'var(--primary)' }} />
            </Card>
          </Link>

          <Link href="/about" prefetch className="group no-underline">
            <Card variant="surface" className="interactive-lift flex h-full items-center gap-4 p-5">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                <UsersRound size={23} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: 'var(--accent)' }}>
                  Về 4B
                </span>
                <span className="brand-font mt-1 block text-base font-bold" style={{ color: 'var(--text-heading)' }}>
                  CÂU CHUYỆN THƯƠNG HIỆU
                </span>
              </span>
              <ArrowUpRight size={17} style={{ color: 'var(--primary)' }} />
            </Card>
          </Link>

          <Link href="/pricing" prefetch className="group no-underline">
            <Card
              className="interactive-lift flex h-full items-center gap-4 border p-5"
              style={{ background: 'var(--dark)', borderColor: 'var(--dark)' }}
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: 'rgba(255, 240, 140, 0.14)', color: 'var(--warning)' }}
              >
                <QrCode size={23} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: 'var(--warning)' }}>
                  Free trước, Pro khi cần
                </span>
                <span className="brand-font mt-1 block text-base font-bold text-white">
                  Gói Free & Pro
                </span>
              </span>
              <ArrowUpRight size={17} style={{ color: 'var(--warning)' }} />
            </Card>
          </Link>
        </div>
      </div>
    </section>
  );
}
