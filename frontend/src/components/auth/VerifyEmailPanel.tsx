'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { authApi } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';

export function VerifyEmailPanel() {
  const search = useSearchParams();
  const token = search.get('token') ?? '';
  const setUser = useAuthStore((s) => s.setUser);
  const [state, setState] = React.useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('Missing verification token');
      return;
    }
    void (async () => {
      try {
        const res = await authApi.verifyEmail(token);
        setUser(res.data.user);
        setState('ok');
      } catch (e) {
        setState('error');
        setMessage(getApiErrorMessage(e));
      }
    })();
  }, [token, setUser]);

  return (
    <Box sx={{ maxWidth: 480 }}>
      <Typography
        variant="h3"
        sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', mb: 2, fontSize: '2rem' }}
      >
        Email verification
      </Typography>
      {state === 'loading' ? <CircularProgress /> : null}
      {state === 'ok' ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Your email is verified. You can complete checkout now.
        </Alert>
      ) : null}
      {state === 'error' ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>
      ) : null}
      <Button component={Link} href="/profile" variant="contained">
        Go to profile
      </Button>
    </Box>
  );
}
