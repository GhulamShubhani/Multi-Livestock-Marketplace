import type { Metadata } from 'next';
import { ListingDetail } from '@/components/catalog/ListingDetail';
import { APP_NAME } from '@/lib/utils';

type Props = { params: Promise<{ category: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const title = slug.replace(/-/g, ' ');
  return {
    title,
    description: `${title} · ${category} listing on ${APP_NAME}.`,
  };
}

export default async function AnimalDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ListingDetail slug={slug} />;
}
