'use client';

import Link from 'next/link';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { APP_NAME } from '@/lib/utils';

const MotionBox = motion(Box);

const HIGHLIGHTS = [
  {
    title: 'Health-first matching',
    body: "Every listing highlights vaccination, temperament, and care notes so you know what you're welcoming home.",
  },
  {
    title: 'Raised with patience',
    body: 'Our cats are socialized gently — no rush, no pressure — so they settle into real households with ease.',
  },
  {
    title: 'Support after adoption',
    body: 'From first-week tips to long-term guidance, we stay available while your new companion adjusts.',
  },
] as const;

export function HomeAdvertise() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 14 },
        position: 'relative',
        overflow: 'hidden',
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--brand) 92%, #000) 0%, color-mix(in srgb, var(--brand) 70%, #1a2421) 100%)',
        color: '#F7F4EF',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 5, md: 8 }}
          sx={{ alignItems: 'center' }}
        >
          <MotionBox
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65 }}
            sx={{ flex: 1.1, position: 'relative', width: '100%', minHeight: { xs: 280, md: 420 } }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: { xs: 280, md: 420 },
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=1600&q=80"
                alt="A cat and companion sharing a quiet moment at home"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </Box>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            sx={{ flex: 1 }}
          >
            <Typography
              sx={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                fontSize: { xs: '2rem', md: '2.75rem' },
                lineHeight: 1.1,
                mb: 2,
              }}
            >
              Why families choose {APP_NAME}
            </Typography>
            <Typography
              sx={{ color: 'rgba(247,244,239,0.78)', mb: 4, maxWidth: 480, lineHeight: 1.7 }}
            >
              We don’t treat cats like inventory. Each companion is presented with honest photos,
              clear health details, and the story behind them — so your match feels right from day
              one.
            </Typography>

            <Stack spacing={3} sx={{ mb: 4 }}>
              {HIGHLIGHTS.map((item) => (
                <Box key={item.title}>
                  <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{item.title}</Typography>
                  <Typography sx={{ color: 'rgba(247,244,239,0.72)', lineHeight: 1.65 }}>
                    {item.body}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                component={Link}
                href="/cats"
                variant="contained"
                color="secondary"
                size="large"
              >
                Meet our cats
              </Button>
              <Button
                component={Link}
                href="/contact"
                variant="outlined"
                size="large"
                sx={{
                  color: '#F7F4EF',
                  borderColor: 'rgba(247,244,239,0.4)',
                  '&:hover': {
                    borderColor: '#F7F4EF',
                    backgroundColor: 'rgba(247,244,239,0.08)',
                  },
                }}
              >
                Ask a question
              </Button>
            </Stack>
          </MotionBox>
        </Stack>
      </Container>
    </Box>
  );
}
