import { categoryMetadata, makeCategoryPage } from '@/components/catalog/makeCategoryPage';

export const metadata = categoryMetadata(
  'Bulls',
  'Browse bull listings from trusted livestock sellers.',
);
export default makeCategoryPage(
  'bulls',
  'Bulls',
  'Breeding and draught bulls from verified sellers.',
);
