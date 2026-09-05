import type { Metadata } from 'next';
import { ListingsCatalog } from '@/components/catalog/ListingsCatalog';

export const metadata: Metadata = {
  title: 'Animals',
  description:
    'Browse cats, cattle, goats, buffaloes, poultry, and more from trusted sellers across India.',
};

export default function AnimalsPage() {
  return (
    <ListingsCatalog
      title="Animals"
      subtitle="Explore every category in one place — filter by location, breed, gender, and price."
    />
  );
}
