'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Button, Container, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { APP_NAME } from '@/lib/utils';
import type { Category, HeroSlide, HomepageSection } from '@/types/api';
import { OptimizedImage } from '@/components/media/OptimizedImage';
import { inferImageSourceType } from '@/lib/image-source';

const MotionBox = motion(Box);

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    src: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=2400&q=80',
    alt: 'Dairy cows grazing in a green pasture',
    sourceType: 'external',
    sourceLabel: 'External · Unsplash',
  },
  {
    src: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=2400&q=80',
    alt: 'A calm cat resting in soft natural light',
    sourceType: 'external',
    sourceLabel: 'External · Unsplash',
  },
  {
    src: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=2400&q=80',
    alt: 'Goats on a rural farm',
    sourceType: 'external',
    sourceLabel: 'External · Unsplash',
  },
  {
    src: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=2400&q=80',
    alt: 'Poultry on a farmyard',
    sourceType: 'external',
    sourceLabel: 'External · Unsplash',
  },
];

function slidesFromSection(section?: HomepageSection | null): HeroSlide[] {
  const raw = section?.config?.slides;
  if (!Array.isArray(raw) || raw.length === 0) {
    if (section?.image?.url) {
      return [
        {
          src: section.image.url,
          alt: section.image.alt || section.title || APP_NAME,
          sourceType: section.image.sourceType ?? inferImageSourceType(section.image.url),
          sourceLabel: section.image.sourceLabel,
        },
      ];
    }
    return DEFAULT_SLIDES;
  }

  return raw
    .map((item): HeroSlide | null => {
      if (!item || typeof item !== 'object') return null;
      const slide = item as Record<string, unknown>;
      const src =
        typeof slide.src === 'string' ? slide.src : typeof slide.url === 'string' ? slide.url : '';
      if (!src) return null;
      const sourceType =
        slide.sourceType === 'ai' ||
        slide.sourceType === 'external' ||
        slide.sourceType === 'upload'
          ? slide.sourceType
          : inferImageSourceType(src);
      return {
        src,
        alt: typeof slide.alt === 'string' ? slide.alt : APP_NAME,
        sourceType,
        sourceLabel: typeof slide.sourceLabel === 'string' ? slide.sourceLabel : undefined,
      };
    })
    .filter((s): s is HeroSlide => Boolean(s));
}

type Props = {
  heroSection?: HomepageSection | null;
  categories?: Category[];
};

export function HomeHero({ heroSection, categories = [] }: Props) {
  const router = useRouter();
  const slides = React.useMemo(() => {
    const fromCms = slidesFromSection(heroSection);
    return fromCms.length ? fromCms : DEFAULT_SLIDES;
  }, [heroSection]);

  const [index, setIndex] = React.useState(0);
  const [animal, setAnimal] = React.useState('');
  const [location, setLocation] = React.useState('');

  const animalOptions = React.useMemo(() => {
    const fromApi = categories
      .filter((c) => c.isActive !== false)
      .map((c) => ({ value: c.slug, label: c.name }));
    if (fromApi.length) return [{ value: '', label: 'All animals' }, ...fromApi];
    return [
      { value: '', label: 'All animals' },
      { value: 'cats', label: 'Cats' },
      { value: 'cows', label: 'Cows' },
      { value: 'buffaloes', label: 'Buffaloes' },
      { value: 'bulls', label: 'Bulls' },
      { value: 'goats', label: 'Goats' },
      { value: 'chickens', label: 'Chickens' },
    ];
  }, [categories]);

  React.useEffect(() => {
    setIndex(0);
  }, [slides]);

  React.useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set('q', location.trim());
    const base = animal ? `/animals/${animal}` : '/animals';
    const qs = params.toString();
    router.push(qs ? `${base}?${qs}` : base);
  };

  const headline = heroSection?.subtitle || 'Find the right animal from trusted sellers';
  const ctaLabel = heroSection?.ctaText || 'Explore';
  const ctaHref = heroSection?.ctaUrl || '/animals';

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: { xs: '88vh', md: '92vh' },
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        color: '#F7F4EF',
        backgroundColor: '#0C1714',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0 }}>
        <AnimatePresence mode="sync">
          <MotionBox
            key={slides[index]?.src ?? index}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            sx={{ position: 'absolute', inset: 0 }}
          >
            <OptimizedImage
              src={slides[index]?.src}
              alt={slides[index]?.alt ?? APP_NAME}
              fill
              priority={index === 0}
              sizes="100vw"
              objectFit="cover"
              objectPosition="center 35%"
              sourceType={slides[index]?.sourceType}
              sourceLabel={slides[index]?.sourceLabel}
              showSourceBadge
              onError={() => setIndex((i) => (i + 1) % slides.length)}
            />
          </MotionBox>
        </AnimatePresence>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(12,23,20,0.22) 0%, rgba(12,23,20,0.42) 40%, rgba(12,23,20,0.92) 100%)',
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', pb: { xs: 8, md: 12 }, pt: 20 }}>
        <Stack spacing={2.5} sx={{ maxWidth: 680 }}>
          <MotionBox
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <Typography
              component="p"
              sx={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                fontSize: { xs: '2.4rem', sm: '3.4rem', md: '4.4rem' },
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                fontWeight: 650,
              }}
            >
              {heroSection?.title || APP_NAME}
            </Typography>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: 'easeOut' }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.25rem', md: '1.55rem' },
                fontWeight: 500,
                maxWidth: 520,
                lineHeight: 1.35,
              }}
            >
              {headline}
            </Typography>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: 'easeOut' }}
          >
            <Box
              component="form"
              onSubmit={onSearch}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1.25,
                p: 1.25,
                backgroundColor: 'rgba(247,244,239,0.94)',
                borderRadius: 2,
                maxWidth: 560,
              }}
            >
              <TextField
                select
                size="small"
                label="Animal"
                value={animal}
                onChange={(e) => setAnimal(e.target.value)}
                sx={{ minWidth: { sm: 150 }, flex: 1 }}
              >
                {animalOptions.map((opt) => (
                  <MenuItem key={opt.label} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                label="Location"
                placeholder="City or state"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                sx={{ flex: 1.4 }}
              />
              <Button type="submit" variant="contained" color="secondary" sx={{ px: 3 }}>
                Search
              </Button>
            </Box>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32, ease: 'easeOut' }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 0.5 }}>
              <Button
                component={Link}
                href={ctaHref.startsWith('/sell') ? '/animals' : ctaHref}
                variant="contained"
                color="secondary"
                size="large"
                sx={{ px: 3.5 }}
              >
                {ctaLabel === 'Start selling' || /sell/i.test(ctaLabel) ? 'Explore' : ctaLabel}
              </Button>
              <Button
                component={Link}
                href="/contact"
                variant="outlined"
                size="large"
                sx={{
                  px: 3.5,
                  color: '#F7F4EF',
                  borderColor: 'rgba(247,244,239,0.45)',
                  '&:hover': {
                    borderColor: '#F7F4EF',
                    backgroundColor: 'rgba(247,244,239,0.08)',
                  },
                }}
              >
                Contact
              </Button>
            </Stack>
          </MotionBox>
        </Stack>

        {slides.length > 1 ? (
          <Stack direction="row" spacing={1} sx={{ mt: 4 }} aria-label="Hero slides">
            {slides.map((slide, i) => (
              <Box
                key={`${slide.src}-${i}`}
                component="button"
                type="button"
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setIndex(i)}
                sx={{
                  width: i === index ? 28 : 10,
                  height: 4,
                  border: 0,
                  borderRadius: 999,
                  cursor: 'pointer',
                  p: 0,
                  transition: 'width 0.35s ease, background-color 0.35s ease',
                  backgroundColor: i === index ? 'var(--accent)' : 'rgba(247,244,239,0.4)',
                }}
              />
            ))}
          </Stack>
        ) : null}
      </Container>
    </Box>
  );
}
