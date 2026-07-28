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
    if (user) reset({ firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? '' });
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

  const resendVerification = async () => {
    try {
      await authApi.resendVerification(user.email);
      setMessage('Verification email sent');
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 2 }}>
        <Box>
          <Typography
            variant="h2"
            sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: { xs: '2rem', md: '2.6rem' } }}
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
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => void resendVerification()}>
              Resend
            </Button>
          }
        >
          Verify your email to place orders.
        </Alert>
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
                  {order.status} · {order.paymentStatus} · {formatMoney(order.total, order.currency)}
                </Typography>
              </Box>
            ))
          )}
        </Stack>
      ) : null}

      {tab === 2 ? (
        <Stack spacing={2}>
          {(addressesQuery.data?.data.addresses ?? []).length === 0 ? (
            <Typography color="text.secondary">No saved addresses yet. You can enter one at checkout.</Typography>
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
