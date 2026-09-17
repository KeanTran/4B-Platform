import { CloudOff, CreditCard, MousePointerClick } from 'lucide-react';

const ASSURANCES = [
  {
    title: 'Vào thẳng Dashboard',
    description: 'Thử công cụ trước khi quyết định đăng ký.',
    icon: MousePointerClick,
  },
  {
    title: 'Không cần thẻ tín dụng',
    description: 'Gói Free đủ để bắt đầu một phòng mới.',
    icon: CreditCard,
  },
  {
    title: 'Bạn kiểm soát dữ liệu',
    description: 'Chế độ khách lưu dữ liệu ngay trên thiết bị.',
    icon: CloudOff,
  },
];

export function StatsBar() {
  return (
    <section className="px-[5%] pb-8" aria-label="Cam kết khi bắt đầu với 4B">
      <div className="glass-surface mx-auto grid max-w-[1240px] gap-3 rounded-[var(--radius-xl)] p-3 md:grid-cols-3">
        {ASSURANCES.map(({ title, description, icon: Icon }) => (
          <div key={title} className="flex items-center gap-3 rounded-2xl px-4 py-3 sm:px-5">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
            >
              <Icon size={20} />
            </span>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>{title}</p>
              <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
