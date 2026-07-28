import type { Metadata } from 'next';
import { CatDetail } from '@/components/catalog/CatDetail';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.replace(/-/g, ' '),
    description: `Meet ${slug.replace(/-/g, ' ')} on Cat Marketplace.`,
  };
}

export default async function CatDetailPage({ params }: Props) {
  const { slug } = await params;
  return <CatDetail slug={slug} />;
}
