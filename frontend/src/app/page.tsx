import type { Metadata } from 'next';
import { HomePageView } from '@/components/home/HomePageView';
import { APP_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: `${APP_NAME} · Find trusted livestock`,
  description:
    'Buy and sell cats, cattle, goats, sheep, and poultry from trusted sellers across India.',
};

export default function HomePage() {
  return <HomePageView />;
}
