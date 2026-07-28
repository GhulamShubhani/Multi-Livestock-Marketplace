import type { Metadata } from 'next';
import { Container, Typography } from '@mui/material';
import { APP_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with the ${APP_NAME} team.`,
};

export default function ContactPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 10, md: 14 } }}>
      <Typography
        variant="h2"
        sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: { xs: '2rem', md: '2.6rem' } }}
      >
        Contact
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.8 }}>
        Questions about a listing or adoption process? Reach us at{' '}
        <a href="mailto:hello@catmarketplace.local">hello@catmarketplace.local</a>. A full contact form
        ships in Phase 8.
      </Typography>
    </Container>
  );
}
