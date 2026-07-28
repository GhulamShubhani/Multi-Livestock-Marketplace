'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Container, Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { catalogApi } from '@/lib/api/catalog';
import { CatCard } from '@/components/catalog/CatCard';

const MotionBox = motion(Box);

export function HomeFeatured() {
  const query = useQuery({
    queryKey: ['cats', 'featured'],
    queryFn: () => catalogApi.listCats({ featured: true, limit: 4, sort: '-createdAt' }),
  });

  const cats = query.data?.data.cats ?? [];
  if (!query.isLoading && cats.length === 0) return null;

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
        >
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              mb: 1,
            }}
          >
            Featured companions
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 480 }}>
            A few cats ready for a thoughtful match.
          </Typography>
        </MotionBox>

        <Grid container spacing={3}>
          {cats.map((cat) => (
            <Grid key={cat._id} size={{ xs: 12, sm: 6, md: 3 }}>
              <CatCard cat={cat} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
