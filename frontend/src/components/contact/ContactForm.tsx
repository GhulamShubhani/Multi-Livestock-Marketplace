'use client';

import * as React from 'react';
import { Alert, Box, Button, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.email(),
  message: z.string().min(10, 'Please write a bit more'),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const [sent, setSent] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 400));
    setSent(true);
    reset();
  });

  return (
    <>
      {sent ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          Thanks — we&apos;ll get back to you soon.
        </Alert>
      ) : null}
      <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <TextField
            label="Name"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register('name')}
          />
          <TextField
            label="Email"
            type="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Message"
            multiline
            minRows={4}
            error={Boolean(errors.message)}
            helperText={errors.message?.message}
            {...register('message')}
          />
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            Send message
          </Button>
        </Stack>
      </Box>
    </>
  );
}
