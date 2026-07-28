'use client';

import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export function HomeIntro() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="md">
        <MotionBox
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          sx={{ textAlign: 'center' }}
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
          <Typography color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
            Clear profiles, verified details, and a checkout experience built around trust — so you can focus
            on the connection, not the paperwork.
          </Typography>
        </MotionBox>
      </Container>
    </Box>
  );
}
