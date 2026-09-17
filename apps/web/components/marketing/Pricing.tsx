'use client';

import Link from 'next/link';
import { ArrowRight, Check, Minus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { trackEvent } from '@/lib/analytics';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    eyebrow: 'Bắt đầu nhẹ nhàng',
    price: '0đ',
    period: 'mãi mãi',
    description: 'Đủ để một phòng nhỏ bắt đầu chia sẻ mọi thứ rõ ràng hơn.',
    features: [
      'Tối đa 4 thành viên',
      'Dashboard và chia tiền cơ bản',
      'VietQR và lịch trực nhật',
      '5 lượt hỏi 4B AI mỗi tháng',
      'Lịch sử 30 ngày',
    ],
    cta: 'Dùng Free ngay',
    href: '/dashboard',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    eyebrow: 'Cho phòng dùng thường xuyên',
    price: '29.000đ',
    period: '/ tháng',
    description: 'Nhiều hạn mức hơn, báo cáo sâu hơn và ít việc thủ công hơn.',
    features: [
      'Không giới hạn thành viên',
      'Mọi tính năng của Free',
      '100 lượt hỏi 4B AI mỗi tháng',
      'Báo cáo và lịch sử không giới hạn',
      'Ưu tiên tính năng mới và hỗ trợ',
    ],
    cta: 'Đăng ký trải nghiệm Pro',
    href: '/register?plan=pro',
    highlighted: true,
  },
] as const;

const COMPARISON = [
  { feature: 'Dashboard và chia tiền', free: 'Có', pro: 'Có' },
  { feature: 'Thành viên trong phòng', free: 'Tối đa 4', pro: 'Không giới hạn' },
  { feature: '4B AI mỗi tháng', free: '5 lượt', pro: '100 lượt' },
  { feature: 'Lịch sử dữ liệu', free: '30 ngày', pro: 'Không giới hạn' },
  { feature: 'Báo cáo nâng cao', free: false, pro: true },
] as const;

export function Pricing() {
  return (
    <section id="pricing" className="px-[5%] py-20">
      <div className="mx-auto max-w-[1240px]">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em]" style={{ color: 'var(--primary)' }}>
            Free trước, Pro khi cần
          </p>
          <h2 className="brand-font text-3xl font-extrabold leading-tight md:text-[42px]" style={{ color: 'var(--text-heading)' }}>
            Trả tiền cho hạn mức tốt hơn, không khóa trải nghiệm cơ bản
          </h2>
          <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Bạn có thể dùng 4B miễn phí thật sự. Pro dành cho những phòng muốn dùng AI nhiều hơn và giữ dữ liệu lâu hơn.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-2">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              variant={plan.highlighted ? 'glass-strong' : 'surface'}
              className={`relative flex h-full flex-col p-6 sm:p-8 ${plan.highlighted ? 'ring-2 ring-[var(--primary)]' : ''}`}
            >
              {plan.highlighted && (
                <span
                  className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold text-white"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <Sparkles size={12} />
                  Đáng nâng cấp nhất
                </span>
              )}

              <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>
                {plan.eyebrow}
              </p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <h3 className="brand-font text-3xl font-extrabold" style={{ color: 'var(--text-heading)' }}>
                  {plan.name}
                </h3>
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-bold"
                  style={{ background: plan.highlighted ? 'var(--primary-light)' : 'var(--bg-light)', color: 'var(--primary-dark)' }}
                >
                  {plan.highlighted ? 'Cho nhu cầu cao' : 'Không cần thẻ'}
                </span>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="brand-font text-4xl font-extrabold sm:text-5xl" style={{ color: plan.highlighted ? 'var(--primary)' : 'var(--text-heading)' }}>
                  {plan.price}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
              </div>
              <p className="mt-4 min-h-12 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
                {plan.description}
              </p>

              <ul className="my-7 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-main)' }}>
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button asChild variant={plan.highlighted ? 'primary' : 'outline'} size="lg" className="w-full">
                <Link
                  href={plan.href}
                  onClick={() =>
                    trackEvent(plan.highlighted ? 'upgrade_clicked' : 'cta_clicked', {
                      location: 'pricing',
                      plan: plan.id,
                    })
                  }
                >
                  {plan.cta}
                  <ArrowRight size={16} />
                </Link>
              </Button>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-[var(--radius-xl)] border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="grid grid-cols-[minmax(140px,1fr)_90px_110px] border-b px-4 py-3 text-xs font-extrabold uppercase tracking-wide sm:grid-cols-[1fr_150px_150px] sm:px-6" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <span>So sánh nhanh</span>
            <span className="text-center">Free</span>
            <span className="text-center" style={{ color: 'var(--primary)' }}>Pro</span>
          </div>
          {COMPARISON.map((row) => (
            <div key={row.feature} className="grid grid-cols-[minmax(140px,1fr)_90px_110px] items-center border-b px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[1fr_150px_150px] sm:px-6" style={{ borderColor: 'var(--border)' }}>
              <span className="font-medium" style={{ color: 'var(--text-main)' }}>{row.feature}</span>
              {[row.free, row.pro].map((value, index) => (
                <span key={`${row.feature}-${index}`} className="flex justify-center" style={{ color: index === 1 ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {typeof value === 'boolean' ? (
                    value ? <Check size={17} aria-label="Có" /> : <Minus size={17} aria-label="Không" />
                  ) : (
                    <span className="text-center text-xs font-bold sm:text-sm">{value}</span>
                  )}
                </span>
              ))}
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Không trừ tiền tự động. Bạn luôn có thể bắt đầu với Free và chỉ nâng cấp khi thấy phù hợp.
        </p>
      </div>
    </section>
  );
}
