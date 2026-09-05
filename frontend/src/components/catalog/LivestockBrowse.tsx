'use client';

import { useQueries } from '@tanstack/react-query';
import { Box, CircularProgress, Container, Grid, Typography } from '@mui/material';
import { catalogApi } from '@/lib/api/catalog';
import { ListingCard } from '@/components/catalog/ListingCard';
import { RequireAuth } from '@/components/auth/RequireAuth';
import type { Listing } from '@/types/api';

const LIVESTOCK_CATEGORIES = ['cows', 'buffaloes', 'bulls'] as const;

export function LivestockBrowse({
  title = 'Livestock',
  subtitle = 'Cows, buffaloes, and bulls from farms across India.',
  categories = LIVESTOCK_CATEGORIES as unknown as string[],
}: {
  title?: string;
  subtitle?: string;
  categories?: string[];
}) {
  const queries = useQueries({
    queries: categories.map((category) => ({
      queryKey: ['listings', 'browse', category],
      queryFn: () => catalogApi.listListings({ category, limit: 24, sort: '-createdAt' }),
    })),
  });

  const loading = queries.some((q) => q.isLoading);
  const map = new Map<string, Listing>();
  for (const q of queries) {
    for (const item of q.data?.data.listings ?? []) map.set(item._id, item);
  }
  const listings = Array.from(map.values());

  return (
    <RequireAuth loadingLabel="Sign in required to browse livestock…">
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          variant="h2"
          sx={{
            fontFamily: 'var(--font-fraunces), Georgia, serif',
            fontSize: { xs: '2rem', md: '2.75rem' },
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 560 }}>
          {subtitle}
        </Typography>

        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : listings.length === 0 ? (
          <Typography color="text.secondary">No livestock listings yet.</Typography>
        ) : (
          <Grid container spacing={3}>
            {listings.map((listing) => (
              <Grid key={listing._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <ListingCard listing={listing} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </RequireAuth>
  );
}
