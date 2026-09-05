import { categoryMetadata, makeCategoryPage } from '@/components/catalog/makeCategoryPage';

export const metadata = categoryMetadata(
  'Chickens',
  'Browse chicken and poultry listings from trusted sellers.',
);
export default makeCategoryPage('chickens', 'Chickens', 'Broilers, layers, and farm poultry.');
