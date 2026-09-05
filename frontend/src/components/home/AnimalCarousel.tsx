'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Button, Container, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { motion } from 'framer-motion';
import type { Listing } from '@/types/api';
import { ListingCard } from '@/components/catalog/ListingCard';
import { AuthGateDialog } from '@/components/auth/AuthGateDialog';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';

const MotionBox = motion(Box);

type Props = {
  title: string;
  subtitle: string;
  listings: Listing[];
  loading?: boolean;
  href?: string;
  linkLabel?: string;
  /** When set, "See more" requires auth; guests get AuthGateDialog */
  authGateHref?: string;
  autoPlayMs?: number;
};

export function AnimalCarousel({
  title,
  subtitle,
  listings,
  loading,
  href,
  linkLabel = 'See more',
  authGateHref,
  autoPlayMs = 4200,
}: Props) {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = React.useState(false);
  const [gateOpen, setGateOpen] = React.useState(false);
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const router = useRouter();
  const seeMoreTarget = authGateHref ?? href;

  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.85, 360);
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  React.useEffect(() => {
    if (!listings.length || paused) return;
    const el = scrollerRef.current;
    if (!el) return;

    const id = window.setInterval(() => {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: Math.min(el.clientWidth * 0.7, 320), behavior: 'smooth' });
      }
    }, autoPlayMs);

    return () => window.clearInterval(id);
  }, [listings.length, paused, autoPlayMs]);

  const onSeeMore = () => {
    if (!seeMoreTarget) return;
    if (authGateHref) {
      if (status === 'loading' || status === 'idle') return;
      if (user) {
        router.push(authGateHref);
        return;
      }
      setGateOpen(true);
      return;
    }
    router.push(seeMoreTarget);
  };

  if (!loading && listings.length === 0) return null;

  return (
    <Box component="section" sx={{ py: { xs: 7, md: 11 } }}>
      <Container maxWidth="lg">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { sm: 'flex-end' }, justifyContent: 'space-between', mb: 3 }}
          >
            <Box sx={{ maxWidth: 520 }}>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'var(--font-fraunces), Georgia, serif',
                  fontSize: { xs: '1.8rem', md: '2.4rem' },
                  mb: 1,
                }}
              >
                {title}
              </Typography>
              <Typography color="text.secondary">{subtitle}</Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <IconButton
                aria-label="Previous"
                onClick={() => scrollByCards(-1)}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                aria-label="Next"
                onClick={() => scrollByCards(1)}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <ChevronRightIcon />
              </IconButton>
              {seeMoreTarget ? (
                authGateHref ? (
                  <Button variant="text" color="secondary" onClick={onSeeMore}>
                    {linkLabel}
                  </Button>
                ) : (
                  <Button component={Link} href={seeMoreTarget} variant="text" color="secondary">
                    {linkLabel}
                  </Button>
                )
              ) : null}
            </Stack>
          </Stack>
        </MotionBox>

        <Box
          ref={scrollerRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          sx={{
            display: 'flex',
            gap: 2.5,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            pb: 1,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {(loading ? Array.from({ length: 4 }) : listings).map((listing, i) => (
            <Box
              key={loading ? `skeleton-${i}` : (listing as Listing)._id}
              sx={{
                flex: '0 0 auto',
                width: { xs: '78%', sm: '46%', md: '28%', lg: '23%' },
                scrollSnapAlign: 'start',
                minHeight: 320,
              }}
            >
              {loading ? (
                <Box>
                  <Skeleton variant="rectangular" sx={{ aspectRatio: '4 / 5', mb: 1.5 }} />
                  <Skeleton width="75%" sx={{ mb: 0.75 }} />
                  <Skeleton width="45%" />
                </Box>
              ) : (
                <ListingCard listing={listing as Listing} />
              )}
            </Box>
          ))}
        </Box>
      </Container>

      {authGateHref ? (
        <AuthGateDialog
          open={gateOpen}
          onClose={() => setGateOpen(false)}
          nextPath={authGateHref}
          title="Sign in to see more"
          description="Sign in to browse the full catalog and save animals you like."
        />
      ) : null}
    </Box>
  );
}
