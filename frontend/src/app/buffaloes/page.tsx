import { categoryMetadata, makeCategoryPage } from '@/components/catalog/makeCategoryPage';

export const metadata = categoryMetadata(
  'Buffaloes',
  'Browse buffalo listings from trusted livestock sellers.',
);
export default makeCategoryPage(
  'buffaloes',
  'Buffaloes',
  'Buffalo livestock with clear pricing and seller contact.',
);
