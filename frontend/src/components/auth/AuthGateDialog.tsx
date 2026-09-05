'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from '@mui/material';
import { useAuthStore } from '@/stores/auth';

type Props = {
  open: boolean;
  onClose: () => void;
  nextPath: string;
  title?: string;
  description?: string;
};

export function AuthGateDialog({
  open,
  onClose,
  nextPath,
  title = 'Sign in to continue',
  description = 'Create a free account or sign in to browse more listings and save favorites.',
}: Props) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  React.useEffect(() => {
    if (open && user) {
      onClose();
      router.push(nextPath);
    }
  }, [open, user, nextPath, onClose, router]);

  const loginHref = `/auth/login?next=${encodeURIComponent(nextPath)}`;
  const registerHref = `/auth/register?next=${encodeURIComponent(nextPath)}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>{title}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">{description}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button component={Link} href={registerHref} variant="outlined">
          Get started
        </Button>
        <Button component={Link} href={loginHref} variant="contained" color="secondary">
          Sign in
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/** Hook helper: gate navigation behind auth, opening dialog when anonymous. */
export function useAuthGate(nextPath: string) {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const requestAccess = React.useCallback(() => {
    if (status === 'loading' || status === 'idle') return;
    if (user) {
      router.push(nextPath);
      return;
    }
    setOpen(true);
  }, [status, user, router, nextPath]);

  return {
    open,
    setOpen,
    requestAccess,
    dialogProps: {
      open,
      onClose: () => setOpen(false),
      nextPath,
    } satisfies Omit<Props, 'title' | 'description'>,
  };
}
