import type { Metadata } from 'next';
import { Box, Container, Typography } from '@mui/material';
import { APP_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About',
  description: `Learn about ${APP_NAME} and how we help families find the right companion.`,
};

export default function AboutPage() {
  return (
    <Box
      sx={{
        background:
          'radial-gradient(900px 420px at 0% 0%, color-mix(in srgb, var(--brand) 12%, transparent), transparent 70%)',
      }}
    >
      <Container maxWidth="md" sx={{ py: { xs: 10, md: 14 } }}>
        <Typography
          variant="h2"
          sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: { xs: '2rem', md: '2.8rem' } }}
        >
          About {APP_NAME}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 3, lineHeight: 1.85, fontSize: '1.05rem' }}>
          We believe finding a cat should feel calm and clear — not rushed. Every listing is written for
          lasting homes: health details, temperament notes, and a checkout flow built around trust.
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.85, fontSize: '1.05rem' }}>
          From first browse to welcome-home day, our goal is a thoughtful match between people and pets.
        </Typography>
      </Container>
    </Box>
  );
}
