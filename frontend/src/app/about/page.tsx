import type { Metadata } from 'next';
import Link from 'next/link';
import { Box, Button, Container, Grid, Stack, Typography } from '@mui/material';
import { SITE_CONTACT } from '@/lib/site-contact';
import { APP_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About',
  description: `Learn about ${APP_NAME} — a multi-livestock marketplace for trusted buyers and sellers.`,
};

const OFFERINGS = [
  'Companion cats and kittens',
  'Dairy cows and buffaloes',
  'Bulls and draught livestock',
  'Goats, khassi, and sheep',
  'Chickens, ducks, and poultry',
];

const WHY_US = [
  {
    title: 'Honest listings',
    body: 'Photos, breed, age, health notes, and location — so you can compare with confidence.',
  },
  {
    title: 'Direct seller contact',
    body: 'Call, WhatsApp, or enquire after signing in. No opaque middlemen on animal details.',
  },
  {
    title: 'Verified payments',
    body: 'UPI or bank transfer with payment proof reviewed by our team before confirmation.',
  },
  {
    title: 'Built for India',
    body: 'Local cities and states, festival-ready goats, dairy capacity fields, and more.',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Browse',
    body: 'Explore animals by category, location, and price on the public catalog.',
  },
  {
    step: '02',
    title: 'Sign in',
    body: 'Open full listing details — contact and payment info require an account.',
  },
  {
    step: '03',
    title: 'Connect',
    body: 'Message or call the seller, then checkout when you are ready.',
  },
  {
    step: '04',
    title: 'Pay securely',
    body: 'Transfer via UPI/bank and upload proof for human verification.',
  },
];

export default function AboutPage() {
  return (
    <Box
      sx={{
        background: `
          radial-gradient(900px 420px at 0% 0%, color-mix(in srgb, var(--brand) 14%, transparent), transparent 70%),
          radial-gradient(700px 380px at 100% 20%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 65%),
          linear-gradient(180deg, color-mix(in srgb, var(--surface) 100%, #fff) 0%, color-mix(in srgb, var(--brand) 4%, var(--surface)) 100%)
        `,
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 14 } }}>
        <Stack spacing={2} sx={{ maxWidth: 720, mb: { xs: 8, md: 12 } }}>
          <Typography
            component="p"
            sx={{
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: 12,
              fontWeight: 600,
              color: 'secondary.main',
            }}
          >
            Our story
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontSize: { xs: '2.4rem', md: '3.4rem' },
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {APP_NAME}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '1.15rem', md: '1.35rem' },
              lineHeight: 1.55,
              color: 'text.secondary',
              maxWidth: 560,
            }}
          >
            A modern marketplace connecting buyers and sellers of companion animals and farm
            livestock across India.
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 4, md: 8 }} sx={{ mb: { xs: 10, md: 14 } }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              sx={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                fontSize: '1.6rem',
                mb: 2,
              }}
            >
              Company introduction
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.85, mb: 2 }}>
              {APP_NAME} brings cats, cattle, goats, sheep, and poultry into one trusted catalog —
              with clear photos, location context, and direct seller contact after you sign in.
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.85 }}>
              The marketplace is run by {SITE_CONTACT.personName}. We reply during{' '}
              {SITE_CONTACT.hours.toLowerCase()}.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={4}>
              <Box>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-fraunces), Georgia, serif',
                    fontSize: '1.35rem',
                    mb: 1,
                  }}
                >
                  Mission
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  Make buying and selling livestock transparent, local, and respectful — so every
                  match starts with honest information.
                </Typography>
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-fraunces), Georgia, serif',
                    fontSize: '1.35rem',
                    mb: 1,
                  }}
                >
                  Vision
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  Become India&apos;s most trusted multi-species animal marketplace — scalable for
                  new categories without losing buyer trust.
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ mb: { xs: 10, md: 14 } }}>
          <Typography
            sx={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              mb: 1,
            }}
          >
            Why choose us
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 520 }}>
            Built for serious buyers and responsible sellers.
          </Typography>
          <Grid container spacing={3}>
            {WHY_US.map((item) => (
              <Grid key={item.title} size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    py: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography sx={{ fontWeight: 650, mb: 1 }}>{item.title}</Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
                    {item.body}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mb: { xs: 10, md: 14 } }}>
          <Typography
            sx={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              mb: 1,
            }}
          >
            What we offer
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 520 }}>
            Categories we support today — and the architecture grows when you add more.
          </Typography>
          <Stack component="ul" spacing={1.25} sx={{ m: 0, pl: 2.5 }}>
            {OFFERINGS.map((item) => (
              <Typography key={item} component="li" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {item}
              </Typography>
            ))}
          </Stack>
        </Box>

        <Box sx={{ mb: { xs: 10, md: 14 } }}>
          <Typography
            sx={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              mb: 1,
            }}
          >
            How the marketplace works
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {STEPS.map((item) => (
              <Grid key={item.step} size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-fraunces), Georgia, serif',
                    fontSize: '2rem',
                    color: 'secondary.main',
                    mb: 1,
                  }}
                >
                  {item.step}
                </Typography>
                <Typography sx={{ fontWeight: 650, mb: 0.75 }}>{item.title}</Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '0.95rem' }}>
                  {item.body}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mb: { xs: 10, md: 14 } }}>
          <Typography
            sx={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              mb: 2,
            }}
          >
            Trust & safety
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.85, maxWidth: 640, mb: 2 }}>
            Listing details and seller contact are available to authenticated users. Payment proof
            is reviewed before orders are marked paid. Always meet sellers thoughtfully and verify
            animals in person when possible.
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.85, maxWidth: 640 }}>
            Questions? Visit our{' '}
            <Typography
              component={Link}
              href="/contact"
              sx={{ color: 'text.primary', fontWeight: 600, textDecoration: 'underline' }}
            >
              Contact
            </Typography>{' '}
            page — we are here to help.
          </Typography>
        </Box>

        <Box
          sx={{
            py: { xs: 5, md: 7 },
            px: { xs: 3, md: 5 },
            background:
              'linear-gradient(135deg, color-mix(in srgb, var(--brand) 94%, #000) 0%, color-mix(in srgb, var(--brand) 72%, #1a2421) 100%)',
            color: '#F7F4EF',
          }}
        >
          <Typography
            sx={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              mb: 1.5,
            }}
          >
            Ready to find your next animal?
          </Typography>
          <Typography
            sx={{ mb: 3.5, maxWidth: 480, color: 'rgba(247,244,239,0.78)', lineHeight: 1.7 }}
          >
            Browse the catalog publicly, then sign in to unlock full details and seller contact.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              component={Link}
              href="/animals"
              variant="contained"
              color="secondary"
              size="large"
            >
              Browse animals
            </Button>
            <Button
              component={Link}
              href="/contact"
              variant="outlined"
              size="large"
              sx={{
                color: '#F7F4EF',
                borderColor: 'rgba(247,244,239,0.45)',
                '&:hover': { borderColor: '#F7F4EF', backgroundColor: 'rgba(247,244,239,0.08)' },
              }}
            >
              Contact us
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
