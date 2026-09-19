import type { Metadata } from 'next';
import { About } from '@/components/marketing/About';

export const metadata: Metadata = {
  title: 'Về 4B',
  description: 'Câu chuyện thương hiệu, tầm nhìn, sứ mệnh và giá trị cốt lõi của 4B.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="pt-16">
      <About />
    </div>
  );
}
