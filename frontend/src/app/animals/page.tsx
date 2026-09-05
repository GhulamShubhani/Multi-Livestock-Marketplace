import type { Metadata } from 'next';
import { ListingsCatalog } from '@/components/catalog/ListingsCatalog';

export const metadata: Metadata = {
  title: 'Browse animals',
  description: 'Explore cats, cattle, goats, sheep, and poultry from trusted sellers.',
};

export default function AnimalsPage() {
  return (
    <ListingsCatalog
      title="Browse animals"
      subtitle="Filter by category, location, and gender to find the right animal."
    />
  );
}
