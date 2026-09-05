'use client';

import Link from 'next/link';
import { Box, Button, Container, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { Listing } from '@/types/api';
import { ListingCard } from '@/components/catalog/ListingCard';

const MotionBox = motion(Box);

type Props = {
  title: string;
  subtitle?: string;
  listings: Listing[];
  loading?: boolean;
  href?: string;
  linkLabel?: string;
  /** Max cards to show in the grid (default 4) */
  limit?: number;
};

export function CategoryListingsSection({
  title,
  subtitle,
  listings,
  loading,
  href,
  linkLabel = 'View all',
  limit = 4,
}: Props) {
  const items = listings.slice(0, limit);
  if (!loading && items.length === 0) return null;

  return (
    <Box component="section" sx={{ py: { xs: 6, md: 9 } }}>
      <Container maxWidth="lg">
        <MotionBox
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { sm: 'flex-end' }, justifyContent: 'space-between', mb: 3 }}
          >
            <Box sx={{ maxWidth: 560 }}>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'var(--font-fraunces), Georgia, serif',
                  fontSize: { xs: '1.7rem', md: '2.2rem' },
                  mb: 1,
                }}
              >
                {title}
              </Typography>
              {subtitle ? <Typography color="text.secondary">{subtitle}</Typography> : null}
            </Box>
            {href ? (
              <Button component={Link} href={href} variant="text" color="secondary">
                {linkLabel}
              </Button>
            ) : null}
          </Stack>
        </MotionBox>

        <Grid container spacing={3}>
          {(loading ? Array.from({ length: Math.min(limit, 4) }) : items).map((listing, i) => (
            <Grid
              key={loading ? `sk-${i}` : (listing as Listing)._id}
              size={{ xs: 12, sm: 6, md: 3 }}
            >
              {loading ? (
                <Box>
                  <Skeleton variant="rectangular" sx={{ aspectRatio: '4 / 5', mb: 1.5 }} />
                  <Skeleton width="70%" />
                  <Skeleton width="40%" />
                </Box>
              ) : (
                <ListingCard listing={listing as Listing} />
              )}
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
