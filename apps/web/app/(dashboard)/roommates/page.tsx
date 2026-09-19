import type { Metadata } from 'next';
import { RoommateExperience } from '@/components/roommates/RoommateExperience';

export const metadata: Metadata = {
  title: 'Tìm Bạn Ở Ghép',
  description: 'Khám phá hồ sơ và diễn đàn tìm bạn ở ghép phù hợp trên 4B.',
  alternates: { canonical: '/roommates' },
};

export default function RoommatesPage() {
  return <RoommateExperience />;
}
