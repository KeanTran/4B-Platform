'use client';

import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center py-8">
      <Card variant="glass-strong" className="w-full p-7 text-center sm:p-10">
        <span
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: 'var(--color-bg-warning-soft)', color: 'var(--danger)' }}
        >
          <AlertTriangle size={24} aria-hidden="true" />
        </span>
        <h2 className="brand-font mt-5 text-2xl font-extrabold" style={{ color: 'var(--text-heading)' }}>
          Có một chút gián đoạn
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
          Dữ liệu của bạn vẫn được giữ nguyên. Hãy thử tải lại khu vực này hoặc quay về Tổng Quan Thu Chi.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>
            <RotateCcw size={16} />
            Thử lại
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Về Tổng Quan Thu Chi</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
