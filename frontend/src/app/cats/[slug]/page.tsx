import { redirect } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

/** Legacy URL compatibility — also covered by next.config redirects. */
export default async function LegacyCatDetailPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/animals/cats/${slug}`);
}
