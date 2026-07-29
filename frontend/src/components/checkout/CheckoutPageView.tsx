'use client';

import * as React from 'react';
import * as QRCode from 'qrcode';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
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

  const [paymentMethod, setPaymentMethod] = React.useState<'upi' | 'stripe'>('upi');
  const [partialEnabled, setPartialEnabled] = React.useState(false);
  const [pendingPayment, setPendingPayment] = React.useState<null | {
    sessionId: string;
    orderId: string;
    mock: boolean;
    url?: string;
  }>(null);
  const [confirmingMock, setConfirmingMock] = React.useState(false);

  const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID ?? 'catmarketplace@upi';
  const UPI_NAME = process.env.NEXT_PUBLIC_UPI_NAME ?? 'Cat Marketplace';
  const upiUri = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&cu=INR`;
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = React.useState(false);

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

  React.useEffect(() => {
    if (pendingPayment && paymentMethod === 'upi') {
      void QRCode.toDataURL(upiUri)
        .then((url) => setQrDataUrl(url))
        .catch(() => setQrDataUrl(null));
    } else {
      setQrDataUrl(null);
    }
  }, [pendingPayment, paymentMethod, upiUri]);

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

  const confirmMockPayment = async () => {
    if (!pendingPayment) return;
    setConfirmingMock(true);
    setError(null);
    try {
      await paymentApi.mockComplete(pendingPayment.sessionId);
      clear();
      router.push(`/orders/${pendingPayment.orderId}?paid=1`);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Payment confirmation failed'));
    } finally {
      setConfirmingMock(false);
    }
  };

  const proceedToStripeCheckout = () => {
    if (!pendingPayment?.url) {
      setError('Stripe checkout URL is missing');
      return;
    }
    clear();
    window.location.href = pendingPayment.url;
  };

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    if (!user) return;
    if (!user.isEmailVerified) {
      setError(
        'Verify your email before checkout. Check your inbox or profile for a resend option.',
      );
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setBusy(true);
    setPendingPayment(null);
    setConfirmingMock(false);

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

      if (session.data.mock) {
        const shouldAuto = paymentMethod === 'stripe' && mockPay; // dev convenience only for Stripe option

        if (shouldAuto) {
          await paymentApi.mockComplete(session.data.sessionId);
          clear();
          router.push(`/orders/${order._id}?paid=1`);
          return;
        }

        setPendingPayment({ sessionId: session.data.sessionId, orderId: order._id, mock: true });
        return;
      }

      if (session.data.url) {
        if (paymentMethod === 'upi') {
          setPendingPayment({
            sessionId: session.data.sessionId,
            orderId: order._id,
            mock: false,
            url: session.data.url,
          });
          return;
        }

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

  if (pendingPayment) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          variant="h2"
          sx={{
            fontFamily: 'var(--font-fraunces), Georgia, serif',
            fontSize: { xs: '2rem', md: '2.6rem' },
            mb: 1,
          }}
        >
          Complete payment
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {pendingPayment.mock
            ? 'Dev mock mode: click the button after you paid so the order can be marked as paid.'
            : 'UPI instructions: complete payment in the next Stripe checkout step.'}
        </Typography>

        {paymentMethod === 'upi' ? (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              UPI ID: <strong>{UPI_ID}</strong>
            </Alert>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={3}
              sx={{ alignItems: 'flex-start' }}
            >
              <Box sx={{ flex: 1 }}>
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={async () => {
                      setError(null);
                      try {
                        await navigator.clipboard.writeText(UPI_ID);
                        setCopiedUpi(true);
                        setTimeout(() => setCopiedUpi(false), 1200);
                      } catch {
                        setError('Could not copy UPI ID');
                      }
                    }}
                  >
                    {copiedUpi ? 'Copied!' : 'Copy UPI'}
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    If your camera doesn’t scan well, copy the UPI ID above and paste into your UPI
                    app.
                  </Typography>
                </Stack>

                {qrDataUrl ? (
                  <Box
                    sx={{
                      width: { xs: 260, sm: 280 },
                      height: { xs: 260, sm: 280 },
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'grid',
                      placeItems: 'center',
                      backgroundColor: 'background.paper',
                    }}
                  >
                    <img
                      src={qrDataUrl}
                      alt="UPI payment QR code"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </Box>
                ) : (
                  <Typography color="text.secondary">Generating QR…</Typography>
                )}
              </Box>

              <Box sx={{ flex: 1 }}>
                {partialEnabled ? (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Advanced partial payment is not supported by the backend yet. This button will
                    complete the full payment (dev mock).
                  </Alert>
                ) : null}

                {error ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                ) : null}

                {pendingPayment.mock ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    disabled={confirmingMock}
                    onClick={() => void confirmMockPayment()}
                  >
                    {confirmingMock ? 'Confirming…' : 'I have paid'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={proceedToStripeCheckout}
                  >
                    Proceed to Stripe checkout
                  </Button>
                )}
                <Button variant="text" sx={{ ml: 2 }} onClick={() => router.push('/cart')}>
                  Back to cart
                </Button>
              </Box>
            </Stack>
          </>
        ) : (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              Stripe mock mode: click below to mark the order as paid.
            </Alert>
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}
            <Button
              variant="contained"
              color="secondary"
              size="large"
              disabled={confirmingMock}
              onClick={() => void confirmMockPayment()}
            >
              {confirmingMock ? 'Confirming…' : 'Confirm payment'}
            </Button>
            <Button variant="text" sx={{ ml: 2 }} onClick={() => router.push('/cart')}>
              Back to cart
            </Button>
          </>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Typography
        variant="h2"
        sx={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontSize: { xs: '2rem', md: '2.6rem' },
          mb: 1,
        }}
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
            <TextField
              label="Address line 1"
              error={Boolean(errors.line1)}
              helperText={errors.line1?.message}
              {...register('line1')}
            />
            <TextField label="Address line 2" {...register('line2')} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="City"
                error={Boolean(errors.city)}
                helperText={errors.city?.message}
                {...register('city')}
              />
              <TextField fullWidth label="State" {...register('state')} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Postal code"
                error={Boolean(errors.postalCode)}
                helperText={errors.postalCode?.message}
                {...register('postalCode')}
              />
              <TextField
                fullWidth
                label="Country"
                error={Boolean(errors.country)}
                helperText={errors.country?.message}
                {...register('country')}
              />
            </Stack>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ alignItems: { sm: 'center' } }}
            >
              <TextField fullWidth label="Coupon code" {...register('couponCode')} />
              <Button type="button" variant="outlined" onClick={() => void applyCoupon()}>
                Apply
              </Button>
            </Stack>
            <TextField label="Notes" multiline minRows={2} {...register('notes')} />
            <FormControlLabel
              control={
                <Checkbox checked={mockPay} onChange={(e) => setMockPay(e.target.checked)} />
              }
              label="Complete with mock payment (dev) (Stripe option only)"
            />

            <Divider sx={{ my: 1 }} />

            <FormControl component="fieldset">
              <FormLabel component="legend">Payment method</FormLabel>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'upi' | 'stripe')}
              >
                <FormControlLabel
                  value="upi"
                  control={<Radio />}
                  label="UPI payment (copy UPI or QR)"
                />
                <FormControlLabel value="stripe" control={<Radio />} label="Stripe checkout" />
              </RadioGroup>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={partialEnabled}
                  onChange={(e) => setPartialEnabled(e.target.checked)}
                />
              }
              label="Advanced partial payment (optional)"
            />
            {partialEnabled ? (
              <Alert severity="info">
                Optional UI only for now: backend still completes the full amount in dev mock mode.
              </Alert>
            ) : null}

            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              disabled={busy}
            >
              {busy ? 'Placing order…' : 'Place order'}
            </Button>
          </Stack>
        </Box>
      )}
    </Container>
  );
}
