'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Button, Container, IconButton, Stack, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { motion } from 'framer-motion';
import type { Cat } from '@/types/api';
import { CatCard } from '@/components/catalog/CatCard';

const MotionBox = motion(Box);

type Props = {
  title: string;
  subtitle: string;
  cats: Cat[];
  loading?: boolean;
  href?: string;
  linkLabel?: string;
  autoPlayMs?: number;
};

export function HomeCatCarousel({
  title,
  subtitle,
  cats,
  loading,
  href = '/cats',
  linkLabel = 'View all',
  autoPlayMs = 4200,
}: Props) {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = React.useState(false);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.85, 360);
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  React.useEffect(() => {
    if (!cats.length || paused) return;
    const el = scrollerRef.current;
    if (!el) return;

    const id = window.setInterval(() => {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: Math.min(el.clientWidth * 0.7, 320), behavior: 'smooth' });
      }
    }, autoPlayMs);

    return () => window.clearInterval(id);
  }, [cats.length, paused, autoPlayMs]);

  if (!loading && cats.length === 0) return null;

  return (
    <Box component="section" sx={{ py: { xs: 7, md: 11 } }}>
      <Container maxWidth="lg">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { sm: 'flex-end' }, justifyContent: 'space-between', mb: 3 }}
          >
            <Box sx={{ maxWidth: 520 }}>
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
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <IconButton
                aria-label="Previous"
                onClick={() => scrollByCards(-1)}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                aria-label="Next"
                onClick={() => scrollByCards(1)}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <ChevronRightIcon />
              </IconButton>
              <Button component={Link} href={href} variant="text" color="secondary">
                {linkLabel}
              </Button>
            </Stack>
          </Stack>
        </MotionBox>

        <Box
          ref={scrollerRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          sx={{
            display: 'flex',
            gap: 2.5,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            pb: 1,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {(loading ? Array.from({ length: 4 }) : cats).map((cat, i) => (
            <Box
              key={loading ? `skeleton-${i}` : (cat as Cat)._id}
              sx={{
                flex: '0 0 auto',
                width: { xs: '78%', sm: '46%', md: '28%', lg: '23%' },
                scrollSnapAlign: 'start',
                minHeight: 320,
              }}
            >
              {loading ? (
                <Box sx={{ height: 360, backgroundColor: 'action.hover' }} />
              ) : (
                <CatCard cat={cat as Cat} />
              )}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
