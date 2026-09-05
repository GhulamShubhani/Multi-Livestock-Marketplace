'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/lib/api/auth';
import { orderApi, profileApi } from '@/lib/api/commerce';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatMoney } from '@/lib/utils';

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfilePageView() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const [tab, setTab] = React.useState(0);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [otp, setOtp] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpBusy, setOtpBusy] = React.useState(false);

  const ordersQuery = useQuery({
    queryKey: ['orders', 'me'],
    queryFn: () => orderApi.listMine({ limit: 20 }),
    enabled: Boolean(user),
  });

  const addressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: () => profileApi.listAddresses(),
    enabled: Boolean(user),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema) });

  React.useEffect(() => {
    if (status === 'anonymous') router.replace('/auth/login?next=/profile');
  }, [status, router]);

  React.useEffect(() => {
    if (user)
      reset({ firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? '' });
  }, [user, reset]);

  if (status === 'loading' || status === 'idle' || !user) {
    return <Container sx={{ py: 10 }} />;
  }

  const onSave = handleSubmit(async (values) => {
    setError(null);
    try {
      const res = await profileApi.update(values);
      setUser({ ...user, ...res.data.profile });
      setMessage('Profile updated');
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  });

  const sendOtp = async () => {
    setError(null);
    setMessage(null);
    setOtpBusy(true);
    try {
      await authApi.sendOtp(user.email);
      setOtpSent(true);
      setMessage('OTP sent to your email — enter the 6-digit code below.');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not send OTP'));
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyOtp = async () => {
    const code = otp.trim();
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit OTP from your email');
      return;
    }
    setError(null);
    setMessage(null);
    setOtpBusy(true);
    try {
      await authApi.verifyOtp(user.email, code);
      const me = await authApi.me();
      setUser(me.data.user);
      setMessage('Email verified successfully');
      setOtp('');
      setOtpSent(false);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Invalid or expired OTP'));
    } finally {
      setOtpBusy(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 2 }}
      >
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontSize: { xs: '2rem', md: '2.6rem' },
            }}
          >
            Hello, {user.firstName}
          </Typography>
          <Typography color="text.secondary">{user.email}</Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={async () => {
            await logout();
            router.push('/');
          }}
        >
          Sign out
        </Button>
      </Stack>

      {!user.isEmailVerified ? (
        <Box
          sx={{
            mb: 3,
            p: { xs: 2, md: 2.5 },
            border: '1px solid',
            borderColor: 'warning.main',
            borderRadius: 1,
            backgroundColor: 'color-mix(in srgb, var(--accent) 12%, transparent)',
          }}
        >
          <Typography sx={{ fontWeight: 650, mb: 0.75 }}>
            Verify your email to place orders
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
            Click <strong>Send OTP</strong>, then enter the 6-digit code from your email below. In
            local/dev, the code is also printed in the backend console.
          </Typography>
          <Stack spacing={1.5} sx={{ maxWidth: 360 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => void sendOtp()}
                disabled={otpBusy}
              >
                {otpBusy && !otpSent ? 'Sending…' : otpSent ? 'Resend OTP' : 'Send OTP'}
              </Button>
            </Stack>
            {(otpSent || otp.length > 0) && (
              <>
                <TextField
                  label="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  slotProps={{
                    htmlInput: {
                      inputMode: 'numeric',
                      maxLength: 6,
                      autoComplete: 'one-time-code',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => void verifyOtp()}
                  disabled={otpBusy || otp.length !== 6}
                >
                  {otpBusy ? 'Verifying…' : 'Verify OTP'}
                </Button>
              </>
            )}
          </Stack>
        </Box>
      ) : null}

      {message ? (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message}
        </Alert>
      ) : null}
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Profile" />
        <Tab label="Orders" />
        <Tab label="Addresses" />
      </Tabs>

      {tab === 0 ? (
        <Box component="form" onSubmit={onSave}>
          <Stack spacing={2} sx={{ maxWidth: 420 }}>
            <TextField label="First name" {...register('firstName')} />
            <TextField label="Last name" {...register('lastName')} />
            <TextField label="Phone" {...register('phone')} />
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Save
            </Button>
          </Stack>
        </Box>
      ) : null}

      {tab === 1 ? (
        <Stack spacing={2}>
          {(ordersQuery.data?.data.orders ?? []).length === 0 ? (
            <Typography color="text.secondary">No orders yet.</Typography>
          ) : (
            (ordersQuery.data?.data.orders ?? []).map((order) => (
              <Box
                key={order._id}
                component={Link}
                href={`/orders/${order._id}`}
                sx={{
                  display: 'block',
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>{order.orderNumber}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.status} · {order.paymentStatus} ·{' '}
                  {formatMoney(order.total, order.currency)}
                </Typography>
              </Box>
            ))
          )}
        </Stack>
      ) : null}

      {tab === 2 ? (
        <Stack spacing={2}>
          {(addressesQuery.data?.data.addresses ?? []).length === 0 ? (
            <Typography color="text.secondary">
              No saved addresses yet. You can enter one at checkout.
            </Typography>
          ) : (
            (addressesQuery.data?.data.addresses ?? []).map((a) => (
              <Box key={a._id} sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ fontWeight: 600 }}>{a.label || 'Address'}</Typography>
                <Typography color="text.secondary">
                  {a.line1}, {a.city} {a.postalCode}, {a.country}
                </Typography>
              </Box>
            ))
          )}
        </Stack>
      ) : null}
    </Container>
  );
}
