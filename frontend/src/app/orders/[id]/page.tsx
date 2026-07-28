import { Suspense } from 'react';
import { OrderDetailView } from '@/components/orders/OrderDetailView';

type Props = { params: Promise<{ id: string }> };

export default async function OrderPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense>
      <OrderDetailView id={id} />
    </Suspense>
  );
}
