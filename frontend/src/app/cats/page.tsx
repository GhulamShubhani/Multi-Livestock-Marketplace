import type { Metadata } from 'next';
import { CatsCatalog } from '@/components/catalog/CatsCatalog';

export const metadata: Metadata = {
  title: 'Browse Cats',
  description: 'Explore available cats by breed, age, and personality.',
};

export default function CatsPage() {
  return <CatsCatalog />;
}
