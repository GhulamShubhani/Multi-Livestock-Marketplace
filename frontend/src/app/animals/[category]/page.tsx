import type { Metadata } from 'next';
import { ListingsCatalog } from '@/components/catalog/ListingsCatalog';

type Props = { params: Promise<{ category: string }> };

function titleCase(slug: string) {
  return slug
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const label = titleCase(category);
  return {
    title: label,
    description: `Browse ${label.toLowerCase()} listings from trusted sellers on the livestock marketplace.`,
  };
}

export default async function AnimalCategoryPage({ params }: Props) {
  const { category } = await params;
  const label = titleCase(category);
  return (
    <ListingsCatalog
      initialCategory={category}
      hideCategoryFilter
      title={label}
      subtitle={`Available ${label.toLowerCase()} listings with filters for location, breed, and price.`}
    />
  );
}
