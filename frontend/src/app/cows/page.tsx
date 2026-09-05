import { categoryMetadata, makeCategoryPage } from '@/components/catalog/makeCategoryPage';

export const metadata = categoryMetadata(
  'Cows',
  'Browse cow listings from trusted livestock sellers.',
);
export default makeCategoryPage(
  'cows',
  'Cows',
  'Dairy and dual-purpose cows from farms across India.',
);
