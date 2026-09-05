'use client';

import Link from 'next/link';
import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import { APP_NAME } from '@/lib/utils';
import { SITE_CONTACT } from '@/lib/site-contact';

const columns = [
  {
    title: 'Marketplace',
    links: [
      { href: '/animals', label: 'Browse animals' },
      { href: '/livestock', label: 'Livestock' },
      { href: '/cats', label: 'Cats' },
      { href: '/search', label: 'Search' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/auth/register', label: 'Get started' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/contact', label: 'Help' },
      { href: '/profile', label: 'My account' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { href: '/cats', label: 'Cats' },
      { href: '/cows', label: 'Cows' },
      { href: '/buffaloes', label: 'Buffaloes' },
      { href: '/goats', label: 'Goats' },
      { href: '/chickens', label: 'Chickens' },
    ],
  },
];

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
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              variant="h6"
              sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 700 }}
            >
              {APP_NAME}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, maxWidth: 320, lineHeight: 1.7 }}
            >
              Buy and sell cats, cattle, goats, sheep, and poultry from trusted sellers across
              India.
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {SITE_CONTACT.email}
              </Typography>
              {SITE_CONTACT.phone ? (
                <Typography variant="body2" color="text.secondary">
                  {SITE_CONTACT.phone}
                </Typography>
              ) : null}
              <Typography variant="body2" color="text.secondary">
                {SITE_CONTACT.address}
              </Typography>
            </Stack>
          </Grid>

          {columns.map((col) => (
            <Grid key={col.title} size={{ xs: 6, sm: 3, md: 2 }}>
              <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{col.title}</Typography>
              <Stack spacing={1}>
                {col.links.map((link) => (
                  <Typography
                    key={`${col.title}-${link.href}-${link.label}`}
                    component={Link}
                    href={link.href}
                    color="text.secondary"
                    variant="body2"
                    sx={{ textDecoration: 'none', '&:hover': { color: 'text.primary' } }}
                  >
                    {link.label}
                  </Typography>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 5 }}>
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
