'use client';

import { Box, Container, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const PROMISES = [
  {
    title: 'Honest listings',
    body: 'Real photos, clear ages, and no surprise fees at checkout.',
  },
  {
    title: 'Thoughtful pairing',
    body: 'Filters for breed, age, and temperament help you find the right fit.',
  },
  {
    title: 'Secure checkout',
    body: 'Pay with UPI or Stripe — optional advance partial payment when you need it.',
  },
] as const;

export function HomeIntro() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <MotionBox
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6 }}
          sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}
        >
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              mb: 2,
            }}
          >
            A calmer way to find a cat
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 560, mx: 'auto' }}
          >
            Clear profiles, verified details, and a checkout experience built around trust — so you
            can focus on the connection, not the paperwork.
          </Typography>
        </MotionBox>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 4, md: 5 }}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            pt: { xs: 4, md: 5 },
          }}
        >
          {PROMISES.map((item, i) => (
            <MotionBox
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              sx={{ flex: 1 }}
            >
              <Typography
                sx={{
                  fontFamily: 'var(--font-fraunces), Georgia, serif',
                  fontSize: '1.35rem',
                  mb: 1,
                }}
              >
                {item.title}
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {item.body}
              </Typography>
            </MotionBox>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
