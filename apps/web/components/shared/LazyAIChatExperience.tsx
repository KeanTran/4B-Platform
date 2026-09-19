'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const AIChatExperience = dynamic(
  () => import('./AIChatExperience').then((module) => module.AIChatExperience),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[520px] items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Loader2 className="animate-spin" size={18} />
        Đang mở 4B Student AI…
      </div>
    ),
  },
);

export function LazyAIChatExperience() {
  return <AIChatExperience variant="page" />;
}
