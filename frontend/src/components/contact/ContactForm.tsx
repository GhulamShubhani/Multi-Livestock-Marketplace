'use client';

import * as React from 'react';
import { Alert, Box, Button, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Enter a valid email'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
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
    // Storefront contact inbox wiring can plug into CRM later; acknowledge for now.
    await new Promise((r) => setTimeout(r, 450));
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
      <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 560 }}>
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
            label="Phone number"
            error={Boolean(errors.phone)}
            helperText={errors.phone?.message}
            {...register('phone')}
          />
          <TextField
            label="Subject"
            error={Boolean(errors.subject)}
            helperText={errors.subject?.message}
            {...register('subject')}
          />
          <TextField
            label="Message"
            multiline
            minRows={5}
            error={Boolean(errors.message)}
            helperText={errors.message?.message}
            {...register('message')}
          />
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send message'}
          </Button>
        </Stack>
      </Box>
    </>
  );
}
