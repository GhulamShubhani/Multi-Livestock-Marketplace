'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/client';

const schema = z
  .object({
    password: z
      .string()
      .min(12)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const search = useSearchParams();
  const token = search.get('token') ?? '';
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    if (!token) {
      setError('Missing reset token');
      return;
    }
    try {
      await authApi.resetPassword(token, values.password);
      router.push('/auth/login');
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  });

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 420, width: '100%' }}>
      <Typography
        variant="h3"
        sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', mb: 1, fontSize: '2rem' }}
      >
        Choose a new password
      </Typography>
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      <Stack spacing={2}>
        <TextField
          label="New password"
          type="password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Confirm password"
          type="password"
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          Update password
        </Button>
        <Typography variant="body2">
          <Link href="/auth/login">Back to sign in</Link>
        </Typography>
      </Stack>
    </Box>
  );
}
