'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { authApi } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';

export function VerifyEmailPanel() {
  const search = useSearchParams();
  const token = search.get('token') ?? '';
  const pending = search.get('pending') === '1';
  const emailFromQuery = search.get('email') ?? '';
  const nextPath = search.get('next') || '/animals';
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [state, setState] = React.useState<'idle' | 'loading' | 'ok' | 'error' | 'pending'>(
    token ? 'loading' : pending || emailFromQuery ? 'pending' : 'idle',
  );
  const [message, setMessage] = React.useState('');
  const [email, setEmail] = React.useState(emailFromQuery || user?.email || '');
  const [otp, setOtp] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpBusy, setOtpBusy] = React.useState(false);
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [otpInfo, setOtpInfo] = React.useState<string | null>(null);
  const [linkBusy, setLinkBusy] = React.useState(false);
  const [linkInfo, setLinkInfo] = React.useState<string | null>(null);
  const [linkError, setLinkError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) return;
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

  const requireEmail = () => {
    const target = email.trim();
    if (!target) {
      setOtpError('Enter your email address');
      return null;
    }
    return target;
  };

  const sendOtp = async () => {
    const target = requireEmail();
    if (!target) return;
    setOtpBusy(true);
    setOtpError(null);
    setOtpInfo(null);
    try {
      await authApi.sendOtp(target);
      setOtpSent(true);
      setOtpInfo('OTP sent to your email. Enter the 6-digit code below.');
    } catch (e) {
      setOtpError(getApiErrorMessage(e, 'Could not send OTP'));
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyOtp = async () => {
    const target = requireEmail();
    if (!target) return;
    const code = otp.trim();
    if (!/^\d{6}$/.test(code)) {
      setOtpError('Enter the 6-digit OTP from your email');
      return;
    }
    setOtpBusy(true);
    setOtpError(null);
    try {
      await authApi.verifyOtp(target, code);
      try {
        const me = await authApi.me();
        setUser(me.data.user);
      } catch {
        // verified even if session refresh fails
      }
      setState('ok');
    } catch (e) {
      setOtpError(getApiErrorMessage(e, 'Invalid or expired OTP'));
    } finally {
      setOtpBusy(false);
    }
  };

  const resendLink = async () => {
    const target = email.trim();
    if (!target) {
      setLinkError('Enter your email address');
      return;
    }
    setLinkBusy(true);
    setLinkError(null);
    setLinkInfo(null);
    try {
      await authApi.resendVerification(target);
      setLinkInfo('Verification link sent — check your inbox.');
    } catch (e) {
      setLinkError(getApiErrorMessage(e, 'Could not resend verification link'));
    } finally {
      setLinkBusy(false);
    }
  };

  if (state === 'loading') {
    return (
      <Box sx={{ maxWidth: 480, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', mb: 2, fontSize: '2rem' }}
        >
          Verifying email…
        </Typography>
        <CircularProgress />
      </Box>
    );
  }

  if (state === 'ok') {
    return (
      <Box sx={{ maxWidth: 480 }}>
        <Typography
          variant="h3"
          sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', mb: 2, fontSize: '2rem' }}
        >
          Email verified
        </Typography>
        <Alert severity="success" sx={{ mb: 3 }}>
          Your email is verified. You can browse animals and contact sellers.
        </Alert>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button component={Link} href={nextPath} variant="contained" color="secondary">
            Continue
          </Button>
          <Button component={Link} href="/profile" variant="outlined">
            Go to profile
          </Button>
        </Stack>
      </Box>
    );
  }

  const showOtpForm = (
    <Stack spacing={2}>
      <Typography sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '1.25rem' }}>
        Verify with OTP
      </Typography>
      <Typography variant="body2" color="text.secondary">
        We&apos;ll email a 6-digit code. Enter it here to verify your account.
      </Typography>
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <Button
        variant="contained"
        color="secondary"
        onClick={() => void sendOtp()}
        disabled={otpBusy}
      >
        {otpBusy && !otpSent ? 'Sending…' : otpSent ? 'Resend OTP' : 'Send OTP to email'}
      </Button>
      {otpInfo ? <Alert severity="success">{otpInfo}</Alert> : null}
      {otpError ? <Alert severity="error">{otpError}</Alert> : null}
      {(otpSent || otp.length > 0) && (
        <>
          <TextField
            label="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            slotProps={{
              htmlInput: { inputMode: 'numeric', maxLength: 6, autoComplete: 'one-time-code' },
            }}
            placeholder="000000"
          />
          <Button
            variant="contained"
            onClick={() => void verifyOtp()}
            disabled={otpBusy || otp.length !== 6}
          >
            {otpBusy ? 'Verifying…' : 'Verify OTP'}
          </Button>
        </>
      )}
    </Stack>
  );

  const showLinkFallback = (
    <Stack spacing={2}>
      <Typography sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '1.15rem' }}>
        Or use a verification link
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Prefer a one-click link instead of a code? We can resend that too.
      </Typography>
      {linkInfo ? <Alert severity="success">{linkInfo}</Alert> : null}
      {linkError ? <Alert severity="error">{linkError}</Alert> : null}
      <Button variant="outlined" onClick={() => void resendLink()} disabled={linkBusy}>
        {linkBusy ? 'Sending…' : 'Resend verification link'}
      </Button>
    </Stack>
  );

  if (state === 'error' && token) {
    return (
      <Box sx={{ maxWidth: 480 }}>
        <Typography
          variant="h3"
          sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', mb: 2, fontSize: '2rem' }}
        >
          Verification failed
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          {message || 'This link is invalid or has expired.'}
        </Alert>
        {showOtpForm}
        <Divider sx={{ my: 3 }} />
        {showLinkFallback}
        <Button component={Link} href="/auth/login" variant="text" sx={{ mt: 2 }}>
          Back to sign in
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 520 }}>
      <Typography
        variant="h3"
        sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', mb: 1.5, fontSize: '2rem' }}
      >
        Verify your email
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.75 }}>
        Choose OTP (recommended) or open the verification link from your email
        {email ? ` (${email})` : ''}.
      </Typography>

      {user?.isEmailVerified ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          Your email is already verified.
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          Email verification is required before checkout.
        </Alert>
      )}

      {showOtpForm}
      <Divider sx={{ my: 3 }} />
      {showLinkFallback}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
        <Button component={Link} href={nextPath} variant="outlined">
          Continue for now
        </Button>
        <Button component={Link} href="/auth/login" variant="text">
          Sign in
        </Button>
      </Stack>
    </Box>
  );
}
