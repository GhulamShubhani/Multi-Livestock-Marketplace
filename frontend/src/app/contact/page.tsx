import type { Metadata } from 'next';
import { Container, Typography } from '@mui/material';
import { ContactForm } from '@/components/contact/ContactForm';
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
        sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: { xs: '2rem', md: '2.8rem' } }}
      >
        Contact
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2, mb: 4, maxWidth: 480, lineHeight: 1.8 }}>
        Questions about a listing or adoption process? Send a note to the {APP_NAME} team.
      </Typography>
      <ContactForm />
    </Container>
  );
}
