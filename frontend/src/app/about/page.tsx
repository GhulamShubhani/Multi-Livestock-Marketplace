import type { Metadata } from 'next';
import { Container, Typography } from '@mui/material';
import { APP_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About',
  description: `Learn about ${APP_NAME} and how we help families find the right companion.`,
};

export default function AboutPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 10, md: 14 } }}>
      <Typography
        variant="h2"
        sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: { xs: '2rem', md: '2.6rem' } }}
      >
        About us
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.8 }}>
        {APP_NAME} is building a trustworthy path from discovery to adoption — with clear profiles, secure
        checkout, and care-first guidance. Full storytelling content will connect to CMS pages next.
      </Typography>
    </Container>
  );
}
