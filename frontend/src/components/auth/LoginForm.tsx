'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/auth';

const schema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await login(values.email, values.password);
      router.push(search.get('next') || '/profile');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    }
  });

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 420, width: '100%' }}>
      <Typography
        variant="h3"
        sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', mb: 1, fontSize: '2rem' }}
      >
        Sign in
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Welcome back — continue browsing or manage your orders.
      </Typography>
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      <Stack spacing={2}>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
        <Typography variant="body2" color="text.secondary">
          <Link href="/auth/forgot-password">Forgot password?</Link>
          {' · '}
          <Link href="/auth/register">Create account</Link>
        </Typography>
      </Stack>
    </Box>
  );
}
