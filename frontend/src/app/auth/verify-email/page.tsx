import { Suspense } from 'react';
import { Container } from '@mui/material';
import { VerifyEmailPanel } from '@/components/auth/VerifyEmailPanel';

export default function VerifyEmailPage() {
  return (
    <Container sx={{ py: { xs: 8, md: 12 }, display: 'flex', justifyContent: 'center' }}>
      <Suspense>
        <VerifyEmailPanel />
      </Suspense>
    </Container>
  );
}
