import type { Metadata } from 'next';
import { Container, Link as MuiLink, Stack, Typography } from '@mui/material';
import { ContactForm } from '@/components/contact/ContactForm';
import { SITE_CONTACT } from '@/lib/site-contact';
import { APP_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with ${APP_NAME} — email, phone, and message form.`,
};

export default function ContactPage() {
  const { personName, email, phone, whatsapp, address, hours, brand } = SITE_CONTACT;
  const telHref = phone ? `tel:${phone.replace(/\s+/g, '')}` : undefined;
  const waHref = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : undefined;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 10, md: 14 } }}>
      <Typography
        variant="h2"
        sx={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontSize: { xs: '2rem', md: '2.8rem' },
        }}
      >
        Contact
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2, mb: 5, maxWidth: 520, lineHeight: 1.8 }}>
        Questions about a listing or the adoption process? Reach {brand} directly — we reply during
        business hours.
      </Typography>

      <Stack
        spacing={1.25}
        sx={{
          mb: 6,
          p: { xs: 2.5, md: 3 },
          borderRadius: 2,
          backgroundColor: 'color-mix(in srgb, var(--brand) 6%, var(--surface))',
          border: '1px solid color-mix(in srgb, var(--brand) 12%, transparent)',
          maxWidth: 480,
        }}
      >
        <Typography
          sx={{
            fontFamily: 'var(--font-fraunces), Georgia, serif',
            fontSize: '1.25rem',
            fontWeight: 600,
          }}
        >
          {personName}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.95rem' }}>
          {brand}
        </Typography>
        <Typography sx={{ pt: 1 }}>
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
            <MuiLink href={telHref} underline="hover" color="inherit" sx={{ fontWeight: 600 }}>
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
        <Typography color="text.secondary">Location: {address}</Typography>
        <Typography color="text.secondary">Hours: {hours}</Typography>
      </Stack>

      <Typography
        variant="h3"
        sx={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontSize: '1.35rem',
          mb: 2,
        }}
      >
        Send a message
      </Typography>
      <ContactForm />
    </Container>
  );
}
