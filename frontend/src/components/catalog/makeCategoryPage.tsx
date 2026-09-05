import type { Metadata } from 'next';
import { ListingsCatalog } from '@/components/catalog/ListingsCatalog';

type Props = {
  category: string;
  title: string;
  description: string;
};

function CategoryCatalogPage({ category, title, description }: Props) {
  return (
    <ListingsCatalog
      initialCategory={category}
      hideCategoryFilter
      title={title}
      subtitle={description}
    />
  );
}

export function makeCategoryPage(category: string, title: string, description: string) {
  const Page = () => (
    <CategoryCatalogPage category={category} title={title} description={description} />
  );
  return Page;
}

export function categoryMetadata(title: string, description: string): Metadata {
  return { title, description };
}
