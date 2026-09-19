import type { Metadata } from 'next';
import { FAQ } from '@/components/marketing/FAQ';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Giải đáp những câu hỏi thường gặp về 4B, gói Free, Pro và dữ liệu người dùng.',
  alternates: { canonical: '/faq' },
};

export default function FAQPage() {
  return (
    <div className="pt-16">
      <FAQ />
    </div>
  );
}
