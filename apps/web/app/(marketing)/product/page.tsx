import type { Metadata } from 'next';
import { Features } from '@/components/marketing/Features';

export const metadata: Metadata = {
  title: 'Sản phẩm',
  description: 'Bộ công cụ 4B giúp quản lý chi phí và cuộc sống ở ghép rõ ràng hơn.',
  alternates: { canonical: '/product' },
};

export default function ProductPage() {
  return (
    <div className="pt-16">
      <Features />
    </div>
  );
}
