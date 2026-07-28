import { Container } from '@mui/material';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <Container sx={{ py: { xs: 8, md: 12 }, display: 'flex', justifyContent: 'center' }}>
      <RegisterForm />
    </Container>
  );
}
