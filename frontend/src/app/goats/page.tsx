import { categoryMetadata, makeCategoryPage } from '@/components/catalog/makeCategoryPage';

export const metadata = categoryMetadata(
  'Goats',
  'Browse goat listings from trusted livestock sellers.',
);
export default makeCategoryPage('goats', 'Goats', 'Goats for milk and meat from local farms.');
