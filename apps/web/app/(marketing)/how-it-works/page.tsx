import type { Metadata } from 'next';
import { HowItWorks } from '@/components/marketing/HowItWorks';

export const metadata: Metadata = {
  title: 'Cách dùng',
  description: 'Ba bước để bắt đầu quản lý chi phí và sinh hoạt chung với 4B.',
  alternates: { canonical: '/how-it-works' },
};

export default function HowItWorksPage() {
  return (
    <div className="pt-16">
      <HowItWorks />
    </div>
  );
}
