'use client';

import Link from 'next/link';
import { Box, Container, Stack, Typography } from '@mui/material';
import { APP_NAME } from '@/lib/utils';

export function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 6,
        mt: 'auto',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, transparent 0%, rgba(155,196,184,0.06) 100%)'
            : 'linear-gradient(180deg, transparent 0%, rgba(26,58,50,0.05) 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 700 }}
            >
              {APP_NAME}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Thoughtfully matched cats for lasting companionship.
            </Typography>
          </Box>
          <Stack direction="row" spacing={3}>
            <Typography component={Link} href="/about" color="text.secondary" sx={{ textDecoration: 'none' }}>
              About
            </Typography>
            <Typography component={Link} href="/contact" color="text.secondary" sx={{ textDecoration: 'none' }}>
              Contact
            </Typography>
            <Typography component={Link} href="/cats" color="text.secondary" sx={{ textDecoration: 'none' }}>
              Browse
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
