'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuthStore } from '@/stores/auth';

type Props = {
  children: React.ReactNode;
  /** Shown while auth state is resolving */
  loadingLabel?: string;
};

/**
 * Client-side route guard. Pair with backend `authenticate` so detail URLs
 * cannot be accessed anonymously via API either.
 */
export function RequireAuth({ children, loadingLabel = 'Checking access…' }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);

  React.useEffect(() => {
    if (status === 'anonymous') {
      const next = encodeURIComponent(pathname || '/');
      router.replace(`/auth/login?next=${next}`);
    }
  }, [status, router, pathname]);

  if (status === 'idle' || status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          py: 16,
          minHeight: '50vh',
        }}
      >
        <CircularProgress size={36} />
        <Typography color="text.secondary" variant="body2">
          {loadingLabel}
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          py: 16,
          minHeight: '50vh',
        }}
      >
        <CircularProgress size={36} />
        <Typography color="text.secondary" variant="body2">
          Redirecting to sign in…
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
