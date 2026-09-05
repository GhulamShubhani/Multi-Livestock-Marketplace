'use client';

import * as React from 'react';
import * as QRCode from 'qrcode';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, Container, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { couponApi, orderApi, paymentApi } from '@/lib/api/commerce';
import { getApiErrorMessage } from '@/lib/api/client';
import { APP_NAME, formatMoney } from '@/lib/utils';

const addressSchema = z.object({
  line1: z.string().min(1, 'Required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'Required'),
  state: z.string().optional(),
  postalCode: z.string().min(1, 'Required'),
  country: z.string().min(2, 'Required'),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
});

const paymentSchema = z.object({
  transactionId: z.string().optional(),
  utr: z.string().optional(),
  paymentDate: z.string().optional(),
  screenshotUrl: z.string().optional(),
});

type AddressValues = z.infer<typeof addressSchema>;
type PaymentValues = z.infer<typeof paymentSchema>;

function qrImageUrl(qrCode: unknown): string | null {
  if (!qrCode) return null;
  if (typeof qrCode === 'string') return qrCode;
  if (typeof qrCode === 'object' && qrCode && 'url' in qrCode) {
    const url = (qrCode as { url?: string }).url;
    return url || null;
  }
  return null;
}

export function CheckoutPageView() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const items = useCartStore((s) => s.items);
  const totalCents = useCartStore((s) => s.totalCents);
  const clear = useCartStore((s) => s.clear);
  const [error, setError] = React.useState<string | null>(null);
  const [discount, setDiscount] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = React.useState(false);

  const methodsQuery = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => paymentApi.methods(),
    enabled: Boolean(orderId),
  });

  const methods = methodsQuery.data?.data.methods;
  const upiId = methods?.upiId || '';
  const receiverName = methods?.receiverName || APP_NAME;
  const apiQr = qrImageUrl(methods?.qrCode);

  const addressForm = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: 'IN' },
  });

  const paymentForm = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentDate: new Date().toISOString().slice(0, 10),
    },
  });

  React.useEffect(() => {
    if (status === 'anonymous') {
      router.replace('/auth/login?next=/checkout');
    }
  }, [status, router]);

  React.useEffect(() => {
    if (!orderId || apiQr || !upiId) {
      if (apiQr) setQrDataUrl(null);
      return;
    }
    const amountMajor = Math.max(0, (totalCents() - discount) / 100);
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(receiverName)}&am=${amountMajor}&cu=INR`;
    void QRCode.toDataURL(upiUri)
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(null));
  }, [orderId, apiQr, upiId, receiverName, discount, totalCents]);

  const applyCoupon = async () => {
    const code = addressForm.getValues('couponCode')?.trim();
    if (!code || !user) return;
    try {
      const res = await couponApi.validate({
        code,
        subtotal: totalCents(),
        listingIds: items.map((i) => i.listingId),
      });
      setDiscount(res.data.discount);
      setError(null);
    } catch (e) {
      setDiscount(0);
      setError(getApiErrorMessage(e, 'Invalid coupon'));
    }
  };

  const onPlaceOrder = addressForm.handleSubmit(async (values) => {
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
    try {
      const orderRes = await orderApi.create({
        items: items.map((i) => ({ listingId: i.listingId, quantity: i.quantity })),
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
      setOrderId(orderRes.data.order._id);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Checkout failed'));
    } finally {
      setBusy(false);
    }
  });

  const onSubmitPayment = paymentForm.handleSubmit(async (values) => {
    if (!orderId) return;
    setError(null);
    setBusy(true);
    try {
      await paymentApi.submit({
        orderId,
        provider: 'upi',
        transactionId: values.transactionId || undefined,
        utr: values.utr || undefined,
        paymentDate: values.paymentDate ? new Date(values.paymentDate).toISOString() : undefined,
        screenshot: values.screenshotUrl?.trim() ? { url: values.screenshotUrl.trim() } : undefined,
      });
      clear();
      setSubmitted(true);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Payment submission failed'));
    } finally {
      setBusy(false);
    }
  });

  if (status === 'loading' || status === 'idle') {
    return <Container sx={{ py: 10 }} />;
  }

  if (!user) return null;

  if (submitted && orderId) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Payment submitted — under verification. We will confirm once the transfer is verified.
        </Alert>
        <Button component={Link} href={`/orders/${orderId}`} variant="contained" color="secondary">
          View order
        </Button>
      </Container>
    );
  }

  if (orderId) {
    const displayQr = apiQr || qrDataUrl;
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
          Pay via UPI
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Amount due {formatMoney(Math.max(0, totalCents() - discount))}
        </Typography>

        {methodsQuery.isError ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Could not load payment methods. You can still submit a transaction ID for verification.
          </Alert>
        ) : null}

        {methods?.instructions ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            {String(methods.instructions)}
          </Alert>
        ) : null}

        {upiId ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            UPI ID: <strong>{upiId}</strong>
            {methods?.mobile ? ` · Mobile: ${methods.mobile}` : ''}
          </Alert>
        ) : null}

        {(methods?.bankName || methods?.accountNumber) && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Bank: {methods.bankName || '—'} · {methods.accountHolder || '—'} · A/C{' '}
            {methods.accountNumber || '—'} · IFSC {methods.ifsc || '—'}
          </Alert>
        )}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
          <Box>
            {upiId ? (
              <Button
                variant="outlined"
                sx={{ mb: 2 }}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(upiId);
                    setCopiedUpi(true);
                    setTimeout(() => setCopiedUpi(false), 1200);
                  } catch {
                    setError('Could not copy UPI ID');
                  }
                }}
              >
                {copiedUpi ? 'Copied!' : 'Copy UPI ID'}
              </Button>
            ) : null}
            {displayQr ? (
              <Box
                sx={{
                  width: 260,
                  height: 260,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayQr}
                  alt="UPI payment QR"
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
            ) : (
              <Typography color="text.secondary">
                QR unavailable — use UPI ID or bank details.
              </Typography>
            )}
          </Box>

          <Box component="form" onSubmit={onSubmitPayment} sx={{ flex: 1 }}>
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}
            <Stack spacing={2}>
              <TextField label="Transaction ID" {...paymentForm.register('transactionId')} />
              <TextField label="UTR" {...paymentForm.register('utr')} />
              <TextField
                label="Payment date"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                {...paymentForm.register('paymentDate')}
              />
              <TextField
                label="Screenshot URL (optional)"
                placeholder="https://..."
                {...paymentForm.register('screenshotUrl')}
              />
              <TextField
                label="Amount paid"
                value={formatMoney(Math.max(0, totalCents() - discount))}
                slotProps={{ input: { readOnly: true } }}
              />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                size="large"
                disabled={busy}
              >
                {busy ? 'Submitting…' : 'Submit payment proof'}
              </Button>
            </Stack>
          </Box>
        </Stack>
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
          Cart is empty. <Link href="/animals">Browse animals</Link>
        </Typography>
      ) : (
        <Box component="form" onSubmit={onPlaceOrder}>
          <Stack spacing={2}>
            <TextField
              label="Address line 1"
              error={Boolean(addressForm.formState.errors.line1)}
              helperText={addressForm.formState.errors.line1?.message}
              {...addressForm.register('line1')}
            />
            <TextField label="Address line 2" {...addressForm.register('line2')} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="City"
                error={Boolean(addressForm.formState.errors.city)}
                helperText={addressForm.formState.errors.city?.message}
                {...addressForm.register('city')}
              />
              <TextField fullWidth label="State" {...addressForm.register('state')} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Postal code"
                error={Boolean(addressForm.formState.errors.postalCode)}
                helperText={addressForm.formState.errors.postalCode?.message}
                {...addressForm.register('postalCode')}
              />
              <TextField
                fullWidth
                label="Country"
                error={Boolean(addressForm.formState.errors.country)}
                helperText={addressForm.formState.errors.country?.message}
                {...addressForm.register('country')}
              />
            </Stack>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ alignItems: { sm: 'center' } }}
            >
              <TextField fullWidth label="Coupon code" {...addressForm.register('couponCode')} />
              <Button type="button" variant="outlined" onClick={() => void applyCoupon()}>
                Apply
              </Button>
            </Stack>
            <TextField label="Notes" multiline minRows={2} {...addressForm.register('notes')} />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              disabled={busy}
            >
              {busy ? 'Placing order…' : 'Place order & pay'}
            </Button>
          </Stack>
        </Box>
      )}
    </Container>
  );
}
