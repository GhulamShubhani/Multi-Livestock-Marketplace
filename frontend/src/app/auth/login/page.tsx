import { Suspense } from 'react';
import { Container } from '@mui/material';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <Container sx={{ py: { xs: 8, md: 12 }, display: 'flex', justifyContent: 'center' }}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </Container>
  );
}
