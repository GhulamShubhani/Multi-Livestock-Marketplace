'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { APP_NAME } from '@/lib/utils';

const MotionBox = motion(Box);

const HERO_SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=2400&q=80',
    alt: 'A calm cat resting in soft natural light',
  },
  {
    src: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=2400&q=80',
    alt: 'An orange tabby looking toward the camera',
  },
  {
    src: 'https://images.unsplash.com/photo-1495366695019-aa49f68b0ae1?auto=format&fit=crop&w=2400&q=80',
    alt: 'A soft grey cat nestled in warm light',
  },
] as const;

export function HomeHero() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: { xs: '88vh', md: '92vh' },
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        color: '#F7F4EF',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0 }}>
        <AnimatePresence mode="sync">
          <MotionBox
            key={HERO_SLIDES[index].src}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            sx={{ position: 'absolute', inset: 0 }}
          >
            {/* Native img avoids Next image-optimizer SSL failures on some Windows setups */}
            <Box
              component="img"
              src={HERO_SLIDES[index].src}
              alt={HERO_SLIDES[index].alt}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 30%',
                display: 'block',
              }}
            />
          </MotionBox>
        </AnimatePresence>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(12,23,20,0.18) 0%, rgba(12,23,20,0.38) 40%, rgba(12,23,20,0.9) 100%)',
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', pb: { xs: 8, md: 12 }, pt: 20 }}>
        <Stack spacing={2.5} sx={{ maxWidth: 640 }}>
          <MotionBox
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <Typography
              component="p"
              sx={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                fontSize: { xs: '2.6rem', sm: '3.6rem', md: '4.6rem' },
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                fontWeight: 650,
              }}
            >
              {APP_NAME}
            </Typography>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: 'easeOut' }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.35rem', md: '1.7rem' },
                fontWeight: 500,
                maxWidth: 520,
                lineHeight: 1.35,
              }}
            >
              Meet your next companion with care.
            </Typography>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: 'easeOut' }}
          >
            <Typography
              sx={{ color: 'rgba(247,244,239,0.82)', maxWidth: 460, fontSize: '1.05rem' }}
            >
              Browse healthy, well-matched cats from trusted listings — thoughtfully curated for
              lasting homes.
            </Typography>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32, ease: 'easeOut' }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
              <Button
                component={Link}
                href="/cats"
                variant="contained"
                color="secondary"
                size="large"
                sx={{ px: 3.5 }}
              >
                Browse cats
              </Button>
              <Button
                component={Link}
                href="/about"
                variant="outlined"
                size="large"
                sx={{
                  px: 3.5,
                  color: '#F7F4EF',
                  borderColor: 'rgba(247,244,239,0.45)',
                  '&:hover': {
                    borderColor: '#F7F4EF',
                    backgroundColor: 'rgba(247,244,239,0.08)',
                  },
                }}
              >
                Our story
              </Button>
            </Stack>
          </MotionBox>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 4 }} aria-label="Hero slides">
          {HERO_SLIDES.map((slide, i) => (
            <Box
              key={slide.src}
              component="button"
              type="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setIndex(i)}
              sx={{
                width: i === index ? 28 : 10,
                height: 4,
                border: 0,
                borderRadius: 999,
                cursor: 'pointer',
                p: 0,
                transition: 'width 0.35s ease, background-color 0.35s ease',
                backgroundColor: i === index ? 'var(--accent)' : 'rgba(247,244,239,0.4)',
              }}
            />
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
