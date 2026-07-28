import { Suspense } from 'react';
import { Container } from '@mui/material';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Container sx={{ py: { xs: 8, md: 12 }, display: 'flex', justifyContent: 'center' }}>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </Container>
  );
}
