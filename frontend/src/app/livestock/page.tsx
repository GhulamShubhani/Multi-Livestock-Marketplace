import type { Metadata } from 'next';
import { LivestockBrowse } from '@/components/catalog/LivestockBrowse';

export const metadata: Metadata = {
  title: 'Livestock',
  description: 'Browse cows, buffaloes, and bulls from trusted sellers.',
};

export default function LivestockPage() {
  return <LivestockBrowse />;
}
