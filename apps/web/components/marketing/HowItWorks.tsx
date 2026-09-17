import { ArrowRight, CheckCircle2, Home, Share2 } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Home,
    title: 'Mở phòng dùng thử',
    description: 'Vào Dashboard ngay, chưa cần tạo tài khoản hay nhập thông tin thanh toán.',
  },
  {
    number: '02',
    icon: CheckCircle2,
    title: 'Thêm việc cần chia',
    description: 'Nhập khoản chi, thành viên hoặc lịch trực; 4B sắp xếp phần còn lại.',
  },
  {
    number: '03',
    icon: Share2,
    title: 'Chia sẻ kết quả',
    description: 'Gửi con số rõ ràng, VietQR đúng tiền và lời nhắc đủ tinh tế cho cả phòng.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-[5%] py-20">
      <div className="mx-auto max-w-[1240px]">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em]" style={{ color: 'var(--primary)' }}>
            Bắt đầu trong vài phút
          </p>
          <h2 className="brand-font text-3xl font-extrabold md:text-[42px]" style={{ color: 'var(--text-heading)' }}>
            Từ chuyện khó nói thành ba bước dễ làm
          </h2>
        </div>

        <ol className="grid gap-4 lg:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.number} className="relative list-none">
                <div className="glass-surface h-full rounded-[var(--radius-xl)] p-6 sm:p-7">
                  <div className="flex items-center justify-between">
                    <span
                      className="brand-font text-xs font-extrabold tracking-[0.18em]"
                      style={{ color: 'var(--primary)' }}
                    >
                      BƯỚC {step.number}
                    </span>
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-2xl"
                      style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
                    >
                      <Icon size={21} />
                    </span>
                  </div>
                  <h3 className="brand-font mt-8 text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
                    {step.description}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-3 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full lg:flex"
                    style={{ background: 'var(--primary)', color: 'white' }}
                  >
                    <ArrowRight size={14} />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
