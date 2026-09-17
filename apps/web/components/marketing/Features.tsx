'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  Bot,
  CalendarCheck2,
  BarChart3,
  QrCode,
  ReceiptText,
  UsersRound,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { trackEvent } from '@/lib/analytics';

const PRODUCTS = [
  {
    icon: BarChart3,
    name: 'Dashboard phòng',
    description: 'Nhìn nhanh tổng chi, khoản đã thu và số tiền còn thiếu trong một màn hình.',
    href: '/dashboard',
    label: 'Free',
    accent: 'primary',
  },
  {
    icon: ReceiptText,
    name: 'Chia tiền linh hoạt',
    description: 'Chia đều, theo tỷ lệ hoặc theo số ngày ở mà không cần tự tính lại.',
    href: '/dashboard/split',
    label: 'Free',
    accent: 'accent',
  },
  {
    icon: CalendarCheck2,
    name: 'Lịch trực nhật',
    description: 'Phân công việc nhà rõ ràng để trách nhiệm không dồn vào một người.',
    href: '/dashboard/duties',
    label: 'Free',
    accent: 'primary',
  },
  {
    icon: QrCode,
    name: 'VietQR cá nhân',
    description: 'Tạo QR đúng số tiền và nội dung, giúp mỗi lần chuyển khoản bớt một bước.',
    href: '/dashboard',
    label: 'Free',
    accent: 'accent',
  },
  {
    icon: Bot,
    name: '4B Student Pro AI',
    description: 'Hỏi cách chia hợp lý, soạn lời nhắc tinh tế và hiểu nhanh tình hình chi tiêu.',
    href: '/dashboard/ai',
    label: 'Free có hạn mức',
    accent: 'pro',
  },
  {
    icon: UsersRound,
    name: 'Không gian đồng bộ',
    description: 'Đăng nhập để chuẩn bị đồng bộ dữ liệu riêng của phòng trên nhiều thiết bị.',
    href: '/register',
    label: 'Tài khoản',
    accent: 'primary',
  },
] as const;

const ACCENT_STYLES = {
  primary: {
    iconBackground: 'var(--color-bg-soft-primary)',
    iconColor: 'var(--primary)',
  },
  accent: {
    iconBackground: 'var(--accent-light)',
    iconColor: 'var(--accent)',
  },
  pro: {
    iconBackground: 'var(--dark)',
    iconColor: 'var(--warning)',
  },
} as const;

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-[1240px] px-[5%] py-20">
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em]" style={{ color: 'var(--primary)' }}>
            Bộ công cụ 4B
          </p>
          <h2 className="brand-font text-3xl font-extrabold leading-tight md:text-[42px]" style={{ color: 'var(--text-heading)' }}>
            Chọn đúng công cụ cho việc đang làm
          </h2>
          <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Không cần học một hệ thống phức tạp. Mỗi nhu cầu là một công cụ rõ ràng và có thể mở dùng ngay.
          </p>
        </div>
        <Link
          href="/dashboard"
          onClick={() => trackEvent('cta_clicked', { location: 'product_catalog', destination: 'dashboard' })}
          className="inline-flex items-center gap-2 text-sm font-bold no-underline"
          style={{ color: 'var(--primary)' }}
        >
          Xem toàn bộ Dashboard
          <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((product) => {
          const Icon = product.icon;
          const accent = ACCENT_STYLES[product.accent];

          return (
            <Card key={product.name} variant="glass" className="interactive-lift group flex h-full flex-col p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: accent.iconBackground, color: accent.iconColor }}
                >
                  <Icon size={23} />
                </span>
                <span
                  className="rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide"
                  style={{ borderColor: 'var(--glass-border-accent)', color: 'var(--text-muted)' }}
                >
                  {product.label}
                </span>
              </div>

              <h3 className="brand-font mt-5 text-lg font-bold" style={{ color: 'var(--text-heading)' }}>
                {product.name}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {product.description}
              </p>

              <Link
                href={product.href}
                onClick={() => trackEvent('cta_clicked', { location: 'product_card', destination: product.href })}
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold no-underline"
                style={{ color: 'var(--primary)' }}
              >
                Dùng công cụ
                <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
