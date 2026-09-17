import Link from 'next/link';
import { Check, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { AIChatExperience } from '@/components/shared/AIChatExperience';

const BENEFITS = [
  {
    icon: Sparkles,
    title: 'Hiểu chuyện ở ghép',
    description: 'Tập trung vào chi phí, việc nhà và giao tiếp trong phòng.',
  },
  {
    icon: ShieldCheck,
    title: 'Riêng tư từ thiết kế',
    description: '4B không lưu nội dung câu hỏi và câu trả lời vào database.',
  },
  {
    icon: Zap,
    title: 'Pro nhiều không gian hơn',
    description: '100 lượt mỗi tháng cho những lúc bạn thật sự cần trợ giúp.',
  },
];

export default function AIPage() {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] border border-[var(--glass-border)] bg-[var(--glass-surface)] p-5 shadow-[var(--shadow-glass)] backdrop-blur-[var(--glass-blur)] md:p-7">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
            <AIChatExperience variant="page" />
          </div>

          <aside className="space-y-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-bg-soft-primary)] px-3 py-1 text-xs font-bold text-[var(--primary-dark)]">
                <Sparkles size={13} aria-hidden="true" />
                4B Student AI
              </span>
              <h1 className="brand-font mt-4 text-2xl font-black text-[var(--text-heading)] md:text-3xl">
                Một người bạn biết cách cân bằng
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                Free vẫn dùng được AI thật. Pro dành cho người muốn hỏi nhiều hơn,
                xử lý nhiều tình huống hơn và không bị ngắt mạch giữa tháng.
              </p>
            </div>

            <div className="space-y-3">
              {BENEFITS.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-2xl border border-[var(--border)] bg-[var(--glass-surface-strong)] p-3.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--glass-highlight)] text-[var(--primary)]">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-heading)]">
                      {title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl [background:var(--gradient-dark)] p-5 text-white shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">4B Pro</p>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-[var(--warning)]">
                  100 lượt/tháng
                </span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-white/80">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[var(--primary-light)]" />
                  Gấp 20 lần hạn mức Free
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[var(--primary-light)]" />
                  Tiếp tục dùng toàn bộ công cụ 4B
                </li>
              </ul>
              <Link
                href="/register?plan=pro"
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[var(--primary-light)] px-4 py-2.5 text-sm font-black text-[var(--primary-dark)] transition hover:-translate-y-0.5"
              >
                Khám phá gói Pro
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
