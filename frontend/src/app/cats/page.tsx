import type { Metadata } from 'next';
import { ListingsCatalog } from '@/components/catalog/ListingsCatalog';

export const metadata: Metadata = {
  title: 'Cats',
  description: 'Browse cat listings from trusted sellers.',
};

export default function CatsPage() {
  return (
    <ListingsCatalog
      initialCategory="cats"
      hideCategoryFilter
      title="Cats"
      subtitle="Companion cats ready for lasting homes."
    />
  );
}
