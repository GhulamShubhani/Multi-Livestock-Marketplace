'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Container, Stack, Typography } from '@mui/material';
import { useAuthStore } from '@/stores/auth';
import { orderApi } from '@/lib/api/commerce';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatMoney } from '@/lib/utils';

export function OrderDetailView({ id }: { id: string }) {
  const router = useRouter();
  const search = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const [cancelError, setCancelError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (status === 'anonymous') router.replace(`/auth/login?next=/orders/${id}`);
  }, [status, router, id]);

  const orderQuery = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getMine(id),
    enabled: Boolean(user),
  });

  const order = orderQuery.data?.data.order;

  const cancel = async () => {
    setCancelError(null);
    try {
      await orderApi.cancel(id);
      await orderQuery.refetch();
    } catch (e) {
      setCancelError(getApiErrorMessage(e));
    }
  };

  if (status === 'loading' || status === 'idle' || !user) {
    return <Container sx={{ py: 10 }} />;
  }

  if (orderQuery.isError || (!orderQuery.isLoading && !order)) {
    return (
      <Container sx={{ py: 10 }}>
        <Alert severity="error">Order not found.</Alert>
      </Container>
    );
  }

  if (!order) return <Container sx={{ py: 10 }} />;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      {search.get('paid') ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          Payment submitted — under verification. Thank you!
        </Alert>
      ) : null}
      {cancelError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {cancelError}
        </Alert>
      ) : null}

      <Typography
        variant="h2"
        sx={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontSize: { xs: '2rem', md: '2.4rem' },
          mb: 1,
        }}
      >
        Order {order.orderNumber}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {order.status} · payment {order.paymentStatus}
      </Typography>

      <Stack spacing={2} sx={{ mb: 4 }}>
        {order.items.map((item, idx) => (
          <Stack
            key={`${item.name}-${idx}`}
            direction="row"
            sx={{ justifyContent: 'space-between' }}
          >
            <Typography>
              {item.name} × {item.quantity}
            </Typography>
            <Typography>{formatMoney(item.lineTotal, order.currency)}</Typography>
          </Stack>
        ))}
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography color="text.secondary">Subtotal</Typography>
          <Typography>{formatMoney(order.subtotal, order.currency)}</Typography>
        </Stack>
        {order.discount > 0 ? (
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography color="text.secondary">Discount</Typography>
            <Typography>−{formatMoney(order.discount, order.currency)}</Typography>
          </Stack>
        ) : null}
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 700 }}>Total</Typography>
          <Typography sx={{ fontWeight: 700 }}>
            {formatMoney(order.total, order.currency)}
          </Typography>
        </Stack>
      </Stack>

      <Typography sx={{ fontWeight: 600, mb: 1 }}>Shipping</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {order.shippingAddress.line1}, {order.shippingAddress.city}{' '}
        {order.shippingAddress.postalCode}, {order.shippingAddress.country}
      </Typography>

      <Stack direction="row" spacing={2}>
        <Button component={Link} href="/profile" variant="outlined">
          Back to profile
        </Button>
        {order.status === 'pending' || order.status === 'paid' ? (
          <Button variant="text" color="error" onClick={() => void cancel()}>
            Cancel order
          </Button>
        ) : null}
      </Stack>
    </Container>
  );
}
