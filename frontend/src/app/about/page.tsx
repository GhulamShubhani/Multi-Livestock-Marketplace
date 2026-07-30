import type { Metadata } from 'next';
import Link from 'next/link';
import { Box, Container, Stack, Typography } from '@mui/material';
import { SITE_CONTACT } from '@/lib/site-contact';
import { APP_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About',
  description: `Learn about ${APP_NAME} and how we help families find the right companion.`,
};

export default function AboutPage() {
  return (
    <Box
      sx={{
        background:
          'radial-gradient(900px 420px at 0% 0%, color-mix(in srgb, var(--brand) 12%, transparent), transparent 70%)',
      }}
    >
      <Container maxWidth="md" sx={{ py: { xs: 10, md: 14 } }}>
        <Typography
          variant="h2"
          sx={{
            fontFamily: 'var(--font-fraunces), Georgia, serif',
            fontSize: { xs: '2rem', md: '2.8rem' },
          }}
        >
          About {APP_NAME}
        </Typography>

        <Stack spacing={2.5} sx={{ mt: 3, maxWidth: 640 }}>
          <Typography color="text.secondary" sx={{ lineHeight: 1.85, fontSize: '1.05rem' }}>
            {APP_NAME} is a calm, careful place to meet cats ready for lasting homes. We believe
            finding a companion should feel clear — not rushed — so every listing includes the
            details that matter: health notes, temperament, and honest photos.
          </Typography>

          <Typography color="text.secondary" sx={{ lineHeight: 1.85, fontSize: '1.05rem' }}>
            From first browse to welcome-home day, our goal is a thoughtful match between people and
            pets. Checkout is built around trust, with options like UPI and card payments when you
            are ready to reserve.
          </Typography>

          <Typography color="text.secondary" sx={{ lineHeight: 1.85, fontSize: '1.05rem' }}>
            The marketplace is run by {SITE_CONTACT.personName}. If you have questions about a
            listing, timing, or how adoption works with us, reach out anytime via the{' '}
            <Typography
              component={Link}
              href="/contact"
              sx={{ color: 'text.primary', fontWeight: 600, textDecoration: 'underline' }}
            >
              Contact
            </Typography>{' '}
            page — we reply during {SITE_CONTACT.hours.toLowerCase()}.
          </Typography>

          <Box
            sx={{
              mt: 2,
              pt: 3,
              borderTop: '1px solid color-mix(in srgb, var(--brand) 14%, transparent)',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                fontSize: '1.2rem',
                fontWeight: 600,
                mb: 1,
              }}
            >
              What we stand for
            </Typography>
            <Stack component="ul" spacing={1} sx={{ m: 0, pl: 2.5, color: 'text.secondary' }}>
              <Typography component="li" sx={{ lineHeight: 1.7 }}>
                Honest listings with health and temperament context
              </Typography>
              <Typography component="li" sx={{ lineHeight: 1.7 }}>
                A quieter browsing experience — less noise, more clarity
              </Typography>
              <Typography component="li" sx={{ lineHeight: 1.7 }}>
                Support from inquiry through reservation
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
