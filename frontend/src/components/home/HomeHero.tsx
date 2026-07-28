'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { APP_NAME } from '@/lib/utils';

const MotionBox = motion(Box);

export function HomeHero() {
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
        <Image
          src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=2400&q=80"
          alt="A calm cat resting in soft natural light"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(12,23,20,0.15) 0%, rgba(12,23,20,0.35) 40%, rgba(12,23,20,0.88) 100%)',
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
            <Typography sx={{ color: 'rgba(247,244,239,0.82)', maxWidth: 460, fontSize: '1.05rem' }}>
              Browse healthy, well-matched cats from trusted listings — thoughtfully curated for lasting homes.
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
      </Container>
    </Box>
  );
}
