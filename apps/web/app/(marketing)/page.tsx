import type { Metadata } from 'next';
import { HomeHub } from '@/components/marketing/HomeHub';
import { buildHomeJsonLd, serializeJsonLd } from '@/lib/site';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildHomeJsonLd()) }}
      />
      <HomeHub />
    </>
  );
}
