'use client';

import Link from 'next/link';
import { Box, Container, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { Category } from '@/types/api';
import { primaryImage } from '@/lib/listing';
import { OptimizedImage } from '@/components/media/OptimizedImage';
import { inferImageSourceType } from '@/lib/image-source';
import { useAuthStore } from '@/stores/auth';

const MotionBox = motion(Box);

const GOAT_IMAGE =
  'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80';

const FALLBACK_IMAGES: Record<string, string> = {
  cats: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
  kittens:
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80',
  cows: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80',
  buffaloes:
    'https://images.unsplash.com/photo-1560493676-04071c5f750b?auto=format&fit=crop&w=800&q=80',
  bulls:
    'https://images.unsplash.com/photo-1545468800-85cc9f7c4e9a?auto=format&fit=crop&w=800&q=80',
  goats: GOAT_IMAGE,
  /** Khassi = castrated male goat — never use pet-dog stock photos */
  khassi: GOAT_IMAGE,
  sheep:
    'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=800&q=80',
  chickens:
    'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
  ducks:
    'https://images.unsplash.com/photo-1555856235-1b0f4e9f7e4a?auto=format&fit=crop&w=800&q=80',
  poultry:
    'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?auto=format&fit=crop&w=800&q=80',
};

function categoryImage(slug: string, category?: Category) {
  const fromApi = primaryImage(category?.image ? [category.image] : undefined);
  // Guard against a previously mis-assigned dog stock photo for khassi
  if (slug === 'khassi') {
    if (!fromApi || fromApi.includes('1583511655857') || /dog|pug|pet/i.test(fromApi)) {
      return GOAT_IMAGE;
    }
  }
  return fromApi ?? FALLBACK_IMAGES[slug] ?? FALLBACK_IMAGES.cats;
}

type Props = {
  categories: Category[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
};

export function CategoryGrid({
  categories,
  loading,
  title = 'Browse by animal',
  subtitle = 'Cats, cattle, goats, sheep, and poultry from trusted sellers.',
}: Props) {
  const user = useAuthStore((s) => s.user);
  const items = loading ? Array.from({ length: 8 }) : categories;

  return (
    <Box component="section" sx={{ py: { xs: 7, md: 10 } }}>
      <Container maxWidth="lg">
        <MotionBox
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
          sx={{ mb: 4, maxWidth: 560 }}
        >
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              mb: 1,
            }}
          >
            {title}
          </Typography>
          <Typography color="text.secondary">{subtitle}</Typography>
        </MotionBox>

        <Grid container spacing={2}>
          {items.map((cat, i) => {
            const category = cat as Category | undefined;
            const slug = category?.slug ?? `skeleton-${i}`;
            const browseHref = category ? `/animals/${category.slug}` : '#';
            const href =
              category && !user ? `/auth/login?next=${encodeURIComponent(browseHref)}` : browseHref;
            const image = categoryImage(slug, category);

            return (
              <Grid key={slug} size={{ xs: 6, sm: 4, md: 3 }}>
                <Box
                  component={category ? Link : 'div'}
                  href={category ? href : undefined}
                  sx={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                    position: 'relative',
                    overflow: 'hidden',
                    aspectRatio: '1 / 1',
                    backgroundColor: 'action.hover',
                    '&:hover img': { transform: 'scale(1.04)' },
                  }}
                >
                  {loading ? (
                    <Skeleton variant="rectangular" sx={{ width: '100%', height: '100%' }} />
                  ) : (
                    <OptimizedImage
                      src={image}
                      alt={category?.name ?? ''}
                      fill
                      sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
                      loading="lazy"
                      sourceType={category?.image?.sourceType ?? inferImageSourceType(image)}
                      sourceLabel={category?.image?.sourceLabel}
                      wrapperSx={{
                        transition: 'transform 0.45s ease',
                        '& img': { transition: 'transform 0.45s ease' },
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(180deg, transparent 35%, rgba(12,23,20,0.82) 100%)',
                    }}
                  />
                  <Stack
                    sx={{
                      position: 'absolute',
                      left: 14,
                      right: 14,
                      bottom: 14,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: 'var(--font-fraunces), Georgia, serif',
                        fontWeight: 600,
                        color: '#F7F4EF',
                        fontSize: '1.15rem',
                      }}
                    >
                      {loading ? '…' : category?.name}
                    </Typography>
                    {!loading && category?.listingCount != null ? (
                      <Typography variant="caption" sx={{ color: 'rgba(247,244,239,0.75)' }}>
                        {category.listingCount} listing{category.listingCount === 1 ? '' : 's'}
                      </Typography>
                    ) : null}
                  </Stack>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
