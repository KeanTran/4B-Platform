'use client';

import Link from 'next/link';
import { ArrowRight, Bot, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { trackEvent } from '@/lib/analytics';

const PRO_USE_CASES = [
  'Gợi ý cách chia phù hợp từng tình huống',
  'Giải thích nhanh số liệu chi tiêu của phòng',
  'Soạn lời nhắc thân thiện, không gây khó xử',
];

export function ProSpotlight() {
  return (
    <section className="px-[5%] py-20">
      <div
        className="relative mx-auto grid max-w-[1240px] overflow-hidden rounded-[32px] p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:p-14"
        style={{ background: 'var(--gradient-dark)', boxShadow: 'var(--shadow-glass)' }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: 'rgba(212, 238, 125, 0.18)' }}
        />

        <div className="relative">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-extrabold"
            style={{ borderColor: 'rgba(255,255,255,0.16)', color: 'var(--warning)' }}
          >
            <Sparkles size={14} />
            4B STUDENT PRO AI
          </span>
          <h2 className="brand-font mt-5 text-3xl font-extrabold leading-tight text-white sm:text-[42px]">
            Dùng AI miễn phí. Nâng cấp khi bạn cần hỏi nhiều hơn.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 sm:text-base" style={{ color: 'var(--color-text-cream-soft)' }}>
            Giống cách ChatGPT giúp bạn bắt đầu miễn phí, 4B giữ những công cụ thiết yếu luôn dễ tiếp cận và dành hạn mức lớn hơn cho người dùng Pro.
          </p>

          <ul className="mt-6 space-y-3">
            {PRO_USE_CASES.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'var(--color-text-cream)' }}>
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--primary)' }}>
                  <Check size={12} strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link
                href="/dashboard/ai"
                onClick={() => trackEvent('cta_clicked', { location: 'pro_spotlight', destination: 'ai' })}
              >
                Thử 4B AI
                <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
              <Link href="#pricing">Xem hạn mức Free & Pro</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-10 lg:mt-0">
          <div className="glass-surface rounded-[26px] p-4 sm:p-5">
            <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: 'var(--glass-border)' }}>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'var(--primary)', color: 'white' }}>
                <Bot size={21} />
              </span>
              <div>
                <p className="text-sm font-bold text-white">4B AI</p>
                <p className="text-[11px]" style={{ color: 'var(--color-text-cream-soft)' }}>Trợ lý cho cuộc sống ở ghép</p>
              </div>
              <span className="ml-auto rounded-full px-2.5 py-1 text-[10px] font-extrabold" style={{ background: 'var(--warning)', color: 'var(--dark-surface)' }}>
                PRO
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-white/10 p-3 text-xs leading-5 text-white">
                Tháng này An chỉ ở 12 ngày, tiền điện nước nên chia thế nào cho hợp lý?
              </div>
              <div className="max-w-[92%] rounded-2xl rounded-bl-md p-3 text-xs leading-5" style={{ background: 'var(--primary-light)', color: 'var(--dark-surface)' }}>
                Bạn có thể chia tiền nhà cố định như cũ, còn điện nước theo số ngày ở. Mình đã tính sẵn tỷ lệ và có thể tạo bảng chia cho cả phòng.
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl border bg-white/5 p-2" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
              <span className="flex-1 px-2 text-xs" style={{ color: 'var(--color-text-cream-soft)' }}>Hỏi 4B về phòng của bạn...</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: 'var(--primary)', color: 'white' }}>
                <ArrowRight size={15} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
