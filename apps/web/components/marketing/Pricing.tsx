'use client';

import Link from 'next/link';

const PLANS = [
  {
    name: 'Miễn Phí',
    price: '0đ',
    period: 'mãi mãi',
    description: 'Dành cho sinh viên và người ở ghép',
    features: [
      'Tối đa 4 thành viên/phòng',
      'Chia đều chi phí cơ bản',
      'Tạo VietQR miễn phí',
      'Nhắc nhở Zalo cơ bản',
      'Lịch sử 30 ngày',
    ],
    cta: 'Bắt Đầu Miễn Phí',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '29,000đ',
    period: '/tháng',
    description: 'Dành cho nhóm lớn hơn hoặc nhu cầu cao hơn',
    features: [
      'Không giới hạn thành viên',
      'Tất cả tính năng Miễn Phí',
      'AI hỗ trợ nâng cao',
      'Báo cáo chi tiết',
      'Lịch sử không giới hạn',
      'Ưu tiên hỗ trợ',
    ],
    cta: 'Nâng Cấp Pro',
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="mx-auto max-w-[1240px] px-[5%] py-[80px]"
    >
      <div className="mb-12 text-center">
        <h2
          className="brand-font mb-3 text-3xl font-extrabold md:text-[36px]"
          style={{ color: 'var(--dark)' }}
        >
          Giá Cả
        </h2>
        <p
          className="text-base"
          style={{ color: 'var(--text-muted)' }}
        >
          Chọn gói phù hợp với nhu cầu của bạn
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 md:px-[10%] lg:px-0">
        {PLANS.map((plan, index) => (
          <div
            key={index}
            className="relative rounded-2xl border p-6 md:p-8"
            style={{
              background: plan.highlighted ? 'var(--color-bg-soft-primary)' : 'var(--surface)',
              borderColor: plan.highlighted
                ? 'var(--color-border-soft-primary)'
                : 'var(--border)',
              borderWidth: plan.highlighted ? 2 : 1,
            }}
          >
            {plan.highlighted && (
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold text-white"
                style={{ background: 'var(--gradient-primary)' }}
              >
                Phổ biến nhất
              </div>
            )}

            <div className="mb-4">
              <h3
                className="mb-1 text-xl font-bold"
                style={{ color: 'var(--dark)' }}
              >
                {plan.name}
              </h3>
              <p
                className="text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                {plan.description}
              </p>
            </div>

            <div className="mb-6">
              <span
                className="brand-font text-4xl font-extrabold"
                style={{ color: plan.highlighted ? 'var(--primary)' : 'var(--dark)' }}
              >
                {plan.price}
              </span>
              <span
                className="text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                {' '}
                {plan.period}
              </span>
            </div>

            <ul className="mb-6 space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <i
                    className="fa-solid fa-check text-[var(--primary)]"
                    style={{ color: plan.highlighted ? 'var(--primary)' : 'var(--primary)' }}
                  />
                  <span style={{ color: 'var(--text-main)' }}>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 ${
                plan.highlighted
                  ? 'text-white shadow-md hover:shadow-lg'
                  : 'border hover:bg-[var(--primary-light)]'
              }`}
              style={
                plan.highlighted
                  ? {
                      background: 'var(--gradient-primary)',
                      boxShadow: '0 4px 12px rgba(63, 127, 18, 0.3)',
                      textDecoration: 'none',
                    }
                  : {
                      borderColor: 'var(--border)',
                      color: 'var(--dark)',
                      background: 'var(--surface)',
                      textDecoration: 'none',
                    }
              }
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <p
        className="mt-6 text-center text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        * Gói Miễn Phí hoàn toàn đủ dùng cho hầu hết sinh viên. Không thẻ tín dụng required.
      </p>
    </section>
  );
}
