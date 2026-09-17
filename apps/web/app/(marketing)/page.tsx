import { Hero } from '@/components/marketing/Hero';
import { StatsBar } from '@/components/marketing/StatsBar';
import { About } from '@/components/marketing/About';
import { Features } from '@/components/marketing/Features';
import { Pricing } from '@/components/marketing/Pricing';
import { Blog } from '@/components/marketing/Blog';
import { FAQ } from '@/components/marketing/FAQ';
import { RegisterSection } from '@/components/marketing/RegisterSection';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { ProSpotlight } from '@/components/marketing/ProSpotlight';

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <ProSpotlight />
      <About />
      <Pricing />
      <FAQ />
      <Blog />
      <RegisterSection />
    </>
  );
}
