import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';
import { DemoModal } from '@/components/marketing';
import { BackToTop } from '@/components/shared/BackToTop';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <DemoModal />
      <BackToTop />
    </div>
  );
}
