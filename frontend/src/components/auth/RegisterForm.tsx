'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/auth';

const schema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.email(),
    phone: z.string().optional(),
    password: z
      .string()
      .min(12, 'At least 12 characters')
      .regex(/[A-Z]/, 'Include an uppercase letter')
      .regex(/[a-z]/, 'Include a lowercase letter')
      .regex(/[0-9]/, 'Include a number')
      .regex(/[^A-Za-z0-9]/, 'Include a symbol'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const [error, setError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await registerUser({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || undefined,
      });
      router.push('/profile');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    }
  });

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 480, width: '100%' }}>
      <Typography
        variant="h3"
        sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', mb: 1, fontSize: '2rem' }}
      >
        Create account
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Join Cat Marketplace to save favorites and check out securely.
      </Typography>
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="First name"
            fullWidth
            error={Boolean(errors.firstName)}
            helperText={errors.firstName?.message}
            {...register('firstName')}
          />
          <TextField
            label="Last name"
            fullWidth
            error={Boolean(errors.lastName)}
            helperText={errors.lastName?.message}
            {...register('lastName')}
          />
        </Stack>
        <TextField
          label="Email"
          type="email"
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          {...register('email')}
        />
        <TextField label="Phone (optional)" {...register('phone')} />
        <TextField
          label="Password"
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
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create account'}
        </Button>
        <Typography variant="body2" color="text.secondary">
          Already have an account? <Link href="/auth/login">Sign in</Link>
        </Typography>
      </Stack>
    </Box>
  );
}
