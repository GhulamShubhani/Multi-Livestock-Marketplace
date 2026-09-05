'use client';

import Link from 'next/link';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { ImageSourceType } from '@/types/api';
import { OptimizedImage } from '@/components/media/OptimizedImage';
import { inferImageSourceType } from '@/lib/image-source';

const MotionBox = motion(Box);

type Props = {
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
  ctaHref: string;
  ctaLabel: string;
  reverse?: boolean;
  tone?: 'brand' | 'surface';
  sourceType?: ImageSourceType;
  sourceLabel?: string;
};

export function HomePromoSection({
  title,
  body,
  imageSrc,
  imageAlt,
  ctaHref,
  ctaLabel,
  reverse,
  tone = 'surface',
  sourceType,
  sourceLabel,
}: Props) {
  const isBrand = tone === 'brand';

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        background: isBrand
          ? 'linear-gradient(135deg, color-mix(in srgb, var(--brand) 92%, #000) 0%, color-mix(in srgb, var(--brand) 70%, #1a2421) 100%)'
          : undefined,
        color: isBrand ? '#F7F4EF' : 'inherit',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: reverse ? 'row-reverse' : 'row' }}
          spacing={{ xs: 4, md: 7 }}
          sx={{ alignItems: 'center' }}
        >
          <MotionBox
            initial={{ opacity: 0, x: reverse ? 24 : -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65 }}
            sx={{ flex: 1.1, width: '100%', minHeight: { xs: 240, md: 380 }, position: 'relative' }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: { xs: 240, md: 380 },
                overflow: 'hidden',
              }}
            >
              <OptimizedImage
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 900px) 100vw, 55vw"
                sourceType={sourceType ?? inferImageSourceType(imageSrc)}
                sourceLabel={sourceLabel}
                showSourceBadge
                loading="lazy"
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
                fontSize: { xs: '1.9rem', md: '2.5rem' },
                lineHeight: 1.15,
                mb: 2,
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                mb: 3.5,
                maxWidth: 460,
                lineHeight: 1.7,
                color: isBrand ? 'rgba(247,244,239,0.78)' : 'text.secondary',
              }}
            >
              {body}
            </Typography>
            <Button
              component={Link}
              href={ctaHref}
              variant="contained"
              color="secondary"
              size="large"
            >
              {ctaLabel}
            </Button>
          </MotionBox>
        </Stack>
      </Container>
    </Box>
  );
}
