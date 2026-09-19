import type { Metadata } from 'next';
import { Pricing } from '@/components/marketing/Pricing';
import { ProSpotlight } from '@/components/marketing/ProSpotlight';

export const metadata: Metadata = {
  title: 'Gói Free & Pro',
  description: 'So sánh hạn mức và quyền lợi của gói 4B Free và Pro.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return (
    <div className="pt-16">
      <ProSpotlight />
      <Pricing />
    </div>
  );
}
