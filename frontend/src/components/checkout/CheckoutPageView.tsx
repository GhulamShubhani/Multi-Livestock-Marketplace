'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { couponApi, orderApi, paymentApi } from '@/lib/api/commerce';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatMoney } from '@/lib/utils';

const schema = z.object({
  line1: z.string().min(1, 'Required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'Required'),
  state: z.string().optional(),
  postalCode: z.string().min(1, 'Required'),
  country: z.string().min(2, 'Required'),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CheckoutPageView() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const items = useCartStore((s) => s.items);
  const totalCents = useCartStore((s) => s.totalCents);
  const clear = useCartStore((s) => s.clear);
  const [error, setError] = React.useState<string | null>(null);
  const [discount, setDiscount] = React.useState(0);
  const [mockPay, setMockPay] = React.useState(true);
  const [busy, setBusy] = React.useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { country: 'US' },
  });

  React.useEffect(() => {
    if (status === 'anonymous') {
      router.replace('/auth/login?next=/checkout');
    }
  }, [status, router]);

  const applyCoupon = async () => {
    const code = getValues('couponCode')?.trim();
    if (!code || !user) return;
    try {
      const res = await couponApi.validate({
        code,
        subtotal: totalCents(),
        catIds: items.map((i) => i.catId),
      });
      setDiscount(res.data.discount);
      setError(null);
    } catch (e) {
      setDiscount(0);
      setError(getApiErrorMessage(e, 'Invalid coupon'));
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    if (!user) return;
    if (!user.isEmailVerified) {
      setError('Verify your email before checkout. Check your inbox or profile for a resend option.');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }
    setBusy(true);
    try {
      const orderRes = await orderApi.create({
        items: items.map((i) => ({ catId: i.catId, quantity: i.quantity })),
        shippingAddress: {
          line1: values.line1,
          line2: values.line2,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: values.country,
        },
        couponCode: values.couponCode || undefined,
        notes: values.notes || undefined,
      });
      const order = orderRes.data.order;
      const session = await paymentApi.checkoutSession(order._id);
      if (mockPay && session.data.mock) {
        await paymentApi.mockComplete(session.data.sessionId);
        clear();
        router.push(`/orders/${order._id}?paid=1`);
        return;
      }
      if (session.data.url) {
        clear();
        window.location.href = session.data.url;
        return;
      }
      clear();
      router.push(`/orders/${order._id}`);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Checkout failed'));
    } finally {
      setBusy(false);
    }
  });

  if (status === 'loading' || status === 'idle') {
    return <Container sx={{ py: 10 }} />;
  }

  if (!user) return null;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Typography
        variant="h2"
        sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: { xs: '2rem', md: '2.6rem' }, mb: 1 }}
      >
        Checkout
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Subtotal {formatMoney(totalCents())}
        {discount > 0 ? ` · Coupon −${formatMoney(discount)}` : ''}
      </Typography>

      {!user.isEmailVerified ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Email verification is required before placing an order.{' '}
          <Link href="/profile">Go to profile</Link>
        </Alert>
      ) : null}

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      {items.length === 0 ? (
        <Typography>
          Cart is empty. <Link href="/cats">Browse cats</Link>
        </Typography>
      ) : (
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField label="Address line 1" error={Boolean(errors.line1)} helperText={errors.line1?.message} {...register('line1')} />
            <TextField label="Address line 2" {...register('line2')} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="City" error={Boolean(errors.city)} helperText={errors.city?.message} {...register('city')} />
              <TextField fullWidth label="State" {...register('state')} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="Postal code" error={Boolean(errors.postalCode)} helperText={errors.postalCode?.message} {...register('postalCode')} />
              <TextField fullWidth label="Country" error={Boolean(errors.country)} helperText={errors.country?.message} {...register('country')} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
              <TextField fullWidth label="Coupon code" {...register('couponCode')} />
              <Button type="button" variant="outlined" onClick={() => void applyCoupon()}>
                Apply
              </Button>
            </Stack>
            <TextField label="Notes" multiline minRows={2} {...register('notes')} />
            <FormControlLabel
              control={<Checkbox checked={mockPay} onChange={(e) => setMockPay(e.target.checked)} />}
              label="Complete with mock payment (dev)"
            />
            <Button type="submit" variant="contained" color="secondary" size="large" disabled={busy}>
              {busy ? 'Placing order…' : 'Place order'}
            </Button>
          </Stack>
        </Box>
      )}
    </Container>
  );
}
