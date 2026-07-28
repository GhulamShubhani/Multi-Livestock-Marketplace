'use client';

import * as React from 'react';
import Link from 'next/link';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/client';

const schema = z.object({ email: z.email() });
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await authApi.forgotPassword(values.email);
      setDone(true);
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
        Reset password
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        We&apos;ll email a reset link if an account exists for that address.
      </Typography>
      {done ? <Alert severity="success">Check your email for reset instructions.</Alert> : null}
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      {!done ? (
        <Stack spacing={2}>
          <TextField
            label="Email"
            type="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Send reset link
          </Button>
        </Stack>
      ) : null}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        <Link href="/auth/login">Back to sign in</Link>
      </Typography>
    </Box>
  );
}
