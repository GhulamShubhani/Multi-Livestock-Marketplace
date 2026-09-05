'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Button, CardActionArea, Chip, Stack, Typography } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
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
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useAuthStore } from '@/stores/auth';
import { wishlistApi } from '@/lib/api/commerce';
import { OptimizedImage } from '@/components/media/OptimizedImage';
import { inferImageSourceType } from '@/lib/image-source';

type Props = {
  listing: Listing;
};

export function ListingCard({ listing }: Props) {
  const addCart = useCartStore((s) => s.addItem);
  const wishHas = useWishlistStore((s) => s.has);
  const addWish = useWishlistStore((s) => s.addItem);
  const removeWish = useWishlistStore((s) => s.removeItem);
  const user = useAuthStore((s) => s.user);
  const liked = wishHas(listing._id);
  const image = primaryImage(listing.images);
  const href = listingHref(listing);
  const categorySlug = categorySlugOf(listing);

  const toggleWish = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item = {
      listingId: listing._id,
      title: listing.title,
      slug: listing.slug,
      categorySlug,
      price: listing.price,
      image,
    };
    if (liked) {
      removeWish(listing._id);
      if (user) {
        try {
          await wishlistApi.remove(listing._id);
        } catch {
          addWish(item);
        }
      }
      return;
    }
    addWish(item);
    if (user) {
      try {
        await wishlistApi.add(listing._id);
      } catch {
        removeWish(listing._id);
      }
    }
  };

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addCart({
      listingId: listing._id,
      title: listing.title,
      slug: listing.slug,
      categorySlug,
      price: listing.price,
      currency: listing.currency,
      image,
      quantity: 1,
    });
  };

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
          {listing.featured ? (
            <Chip
              label="Featured"
              size="small"
              color="secondary"
              sx={{ position: 'absolute', top: 12, left: 12 }}
            />
          ) : null}
          {listing.verificationStatus === 'verified' ? (
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

      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<ShoppingBagOutlinedIcon />}
          onClick={addToCart}
          sx={{ flexGrow: 1 }}
        >
          Add
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={toggleWish}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          sx={{ minWidth: 44 }}
        >
          {liked ? (
            <FavoriteIcon color="secondary" fontSize="small" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
        </Button>
      </Stack>
    </Box>
  );
}
