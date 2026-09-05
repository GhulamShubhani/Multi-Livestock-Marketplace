import type { Metadata } from 'next';
import { Box, Container, Grid, Link as MuiLink, Stack, Typography } from '@mui/material';
import { ContactForm } from '@/components/contact/ContactForm';
import { SITE_CONTACT } from '@/lib/site-contact';
import { APP_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with ${APP_NAME} — email, phone, and message form.`,
};

const FAQS = [
  {
    q: 'Do I need an account to view animal details?',
    a: 'Yes. Catalog browsing is public, but full listing details and seller contact require sign-in.',
  },
  {
    q: 'How do payments work?',
    a: 'Checkout uses UPI or bank transfer. Upload payment proof after transfer; our team verifies before confirming.',
  },
  {
    q: 'How quickly do you reply?',
    a: `We typically respond during ${SITE_CONTACT.hours}. For listing-specific questions, messaging the seller is often fastest.`,
  },
];

export default function ContactPage() {
  const { personName, email, phone, whatsapp, address, hours, brand } = SITE_CONTACT;
  const telHref = phone ? `tel:${phone.replace(/\s+/g, '')}` : undefined;
  const waHref = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : undefined;

  return (
    <Box
      sx={{
        background: `
          radial-gradient(800px 400px at 100% 0%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 70%),
          radial-gradient(700px 360px at 0% 40%, color-mix(in srgb, var(--brand) 10%, transparent), transparent 65%)
        `,
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 14 } }}>
        <Stack spacing={2} sx={{ maxWidth: 640, mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontSize: { xs: '2.2rem', md: '3rem' },
              letterSpacing: '-0.02em',
            }}
          >
            Contact us
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            Questions about a listing, selling livestock, or the buying process? Reach {brand}{' '}
            directly — we reply during business hours.
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 5, md: 8 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack
              spacing={1.25}
              sx={{
                p: { xs: 2.5, md: 3.5 },
                backgroundColor: 'color-mix(in srgb, var(--brand) 6%, var(--surface))',
                border: '1px solid color-mix(in srgb, var(--brand) 12%, transparent)',
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'var(--font-fraunces), Georgia, serif',
                  fontSize: '1.4rem',
                  fontWeight: 600,
                }}
              >
                {personName}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.95rem', pb: 1 }}>
                {brand}
              </Typography>
              <Typography>
                Email:{' '}
                <MuiLink
                  href={`mailto:${email}`}
                  underline="hover"
                  color="inherit"
                  sx={{ fontWeight: 600 }}
                >
                  {email}
                </MuiLink>
              </Typography>
              {phone ? (
                <Typography>
                  Phone:{' '}
                  <MuiLink
                    href={telHref}
                    underline="hover"
                    color="inherit"
                    sx={{ fontWeight: 600 }}
                  >
                    {phone}
                  </MuiLink>
                </Typography>
              ) : null}
              {whatsapp ? (
                <Typography>
                  WhatsApp:{' '}
                  <MuiLink
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    color="inherit"
                    sx={{ fontWeight: 600 }}
                  >
                    {whatsapp}
                  </MuiLink>
                </Typography>
              ) : null}
              <Typography color="text.secondary" sx={{ pt: 1 }}>
                Location: {address}
              </Typography>
              <Typography color="text.secondary">Hours: {hours}</Typography>
            </Stack>

            <Box sx={{ mt: 5 }}>
              <Typography
                sx={{
                  fontFamily: 'var(--font-fraunces), Georgia, serif',
                  fontSize: '1.35rem',
                  mb: 2,
                }}
              >
                Support FAQ
              </Typography>
              <Stack spacing={2.5}>
                {FAQS.map((item) => (
                  <Box key={item.q}>
                    <Typography sx={{ fontWeight: 650, mb: 0.5 }}>{item.q}</Typography>
                    <Typography
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, fontSize: '0.95rem' }}
                    >
                      {item.a}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Typography
              sx={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                fontSize: '1.5rem',
                mb: 1,
              }}
            >
              Send a message
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
              Tell us how we can help. Include the listing ID if your question is about a specific
              animal.
            </Typography>
            <ContactForm />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
