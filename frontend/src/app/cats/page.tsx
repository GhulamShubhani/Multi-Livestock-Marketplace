import type { Metadata } from 'next';
import { Box, Button, Container, Typography } from '@mui/material';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Browse Cats',
  description: 'Explore available cats by breed, age, and personality.',
};

export default function CatsPlaceholderPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 10, md: 14 } }}>
      <Typography
        variant="h2"
        sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: { xs: '2rem', md: '2.6rem' } }}
      >
        Browse cats
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2, mb: 4, maxWidth: 520 }}>
        Catalog browsing, filters, and detail pages arrive in the next frontend phase. The API is already live
        at <code>/api/v1/cats</code>.
      </Typography>
      <Box>
        <Button component={Link} href="/" variant="contained">
          Back home
        </Button>
      </Box>
    </Container>
  );
}
