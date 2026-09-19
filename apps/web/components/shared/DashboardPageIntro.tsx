import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface DashboardPageIntroProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
}

export function DashboardPageIntro({
  icon: Icon,
  eyebrow,
  title,
  description,
}: DashboardPageIntroProps) {
  return (
    <Card variant="glass-strong" className="relative overflow-hidden p-5 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full blur-3xl"
        style={{ background: 'rgba(212, 238, 125, 0.3)' }}
      />
      <div className="relative">
        <div className="flex max-w-3xl items-start gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
          >
            <Icon size={22} aria-hidden="true" />
          </span>
          <div>
            <p
              className="text-[10px] font-extrabold uppercase tracking-[0.18em]"
              style={{ color: 'var(--primary)' }}
            >
              {eyebrow}
            </p>
            <h2
              className="brand-font mt-1 text-2xl font-extrabold sm:text-3xl"
              style={{ color: 'var(--text-heading)' }}
            >
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
              {description}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
