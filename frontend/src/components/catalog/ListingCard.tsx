'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Button, CardActionArea, Chip, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { Listing } from '@/types/api';
import { formatMoney } from '@/lib/utils';
import {
  ageLabel,
  categorySlugOf,
  listingHref,
  locationLabel,
  namedRefName,
  primaryImage,
} from '@/lib/listing';
import { OptimizedImage } from '@/components/media/OptimizedImage';
import { inferImageSourceType } from '@/lib/image-source';

type Props = {
  listing: Listing;
};

export function ListingCard({ listing }: Props) {
  const image = primaryImage(listing.images);
  const href = listingHref(listing);

  const meta = [
    namedRefName(listing.breed),
    ageLabel(listing.ageMonths),
    listing.gender !== 'unknown' ? listing.gender : '',
    locationLabel(listing.location),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2,
      }}
    >
      <CardActionArea
        component={Link}
        href={href}
        sx={{ borderRadius: 0, overflow: 'hidden', mb: 1.5 }}
      >
        <Box
          sx={{
            position: 'relative',
            aspectRatio: '4 / 5',
            overflow: 'hidden',
            backgroundColor: 'action.hover',
          }}
        >
          {image ? (
            <OptimizedImage
              src={image}
              alt={listing.title}
              fill
              sizes="(max-width: 600px) 80vw, (max-width: 900px) 45vw, 25vw"
              loading="lazy"
              sourceType={
                listing.images?.find((i) => i.url === image)?.sourceType ??
                inferImageSourceType(image)
              }
              sourceLabel={listing.images?.find((i) => i.url === image)?.sourceLabel}
            />
          ) : null}
          {namedRefName(listing.category) ? (
            <Chip
              label={namedRefName(listing.category)}
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                bgcolor: 'rgba(12,23,20,0.78)',
                color: '#F7F4EF',
              }}
            />
          ) : null}
          {listing.featured ? (
            <Chip
              label="Featured"
              size="small"
              color="secondary"
              sx={{ position: 'absolute', top: 12, right: 12 }}
            />
          ) : listing.verificationStatus === 'verified' ? (
            <Chip
              label="Verified"
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                bgcolor: 'rgba(26,58,50,0.85)',
                color: '#F7F4EF',
              }}
            />
          ) : null}
        </Box>
      </CardActionArea>

      <Stack spacing={0.75} sx={{ flexGrow: 1 }}>
        <Typography
          component={Link}
          href={href}
          sx={{
            fontFamily: 'var(--font-fraunces), Georgia, serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            textDecoration: 'none',
            color: 'text.primary',
          }}
        >
          {listing.title}
        </Typography>
        {meta ? (
          <Typography variant="body2" color="text.secondary">
            {meta}
          </Typography>
        ) : null}
        <Typography sx={{ fontWeight: 600, mt: 'auto', pt: 1 }}>
          {formatMoney(listing.price, listing.currency)}
          {listing.negotiable ? (
            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              Negotiable
            </Typography>
          ) : null}
        </Typography>
      </Stack>

      <Button
        component={Link}
        href={href}
        size="small"
        variant="contained"
        color="secondary"
        endIcon={<ArrowForwardIcon fontSize="small" />}
        sx={{ mt: 1.5, alignSelf: 'stretch' }}
      >
        View details
      </Button>
    </Box>
  );
}
