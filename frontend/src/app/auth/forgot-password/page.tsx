import { Container } from '@mui/material';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <Container sx={{ py: { xs: 8, md: 12 }, display: 'flex', justifyContent: 'center' }}>
      <ForgotPasswordForm />
    </Container>
  );
}
