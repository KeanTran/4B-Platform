import { Hero } from '@/components/marketing/Hero';
import { StatsBar } from '@/components/marketing/StatsBar';
import { About } from '@/components/marketing/About';
import { Features } from '@/components/marketing/Features';
import { Pricing } from '@/components/marketing/Pricing';
import { Testimonials } from '@/components/marketing/Testimonials';
import { FAQ } from '@/components/marketing/FAQ';
import { RegisterSection } from '@/components/marketing/RegisterSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <About />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <RegisterSection />
    </>
  );
}
