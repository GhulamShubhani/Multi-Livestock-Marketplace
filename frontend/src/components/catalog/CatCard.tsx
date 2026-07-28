'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  CardActionArea,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import type { Cat } from '@/types/api';
import { formatMoney } from '@/lib/utils';
import { ageLabel, namedRefName, primaryImage } from '@/lib/cat';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useAuthStore } from '@/stores/auth';
import { wishlistApi } from '@/lib/api/commerce';

type Props = {
  cat: Cat;
};

export function CatCard({ cat }: Props) {
  const addCart = useCartStore((s) => s.addItem);
  const wishHas = useWishlistStore((s) => s.has);
  const addWish = useWishlistStore((s) => s.addItem);
  const removeWish = useWishlistStore((s) => s.removeItem);
  const user = useAuthStore((s) => s.user);
  const liked = wishHas(cat._id);
  const image = primaryImage(cat.images);

  const toggleWish = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item = {
      catId: cat._id,
      name: cat.name,
      slug: cat.slug,
      price: cat.price,
      image,
    };
    if (liked) {
      removeWish(cat._id);
      if (user) {
        try {
          await wishlistApi.remove(cat._id);
        } catch {
          addWish(item);
        }
      }
      return;
    }
    addWish(item);
    if (user) {
      try {
        await wishlistApi.add(cat._id);
      } catch {
        removeWish(cat._id);
      }
    }
  };

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addCart({
      catId: cat._id,
      name: cat.name,
      slug: cat.slug,
      price: cat.price,
      currency: cat.currency,
      image,
      quantity: 1,
    });
  };

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
        href={`/cats/${cat.slug}`}
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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={cat.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : null}
          {cat.featured ? (
            <Chip
              label="Featured"
              size="small"
              color="secondary"
              sx={{ position: 'absolute', top: 12, left: 12 }}
            />
          ) : null}
        </Box>
      </CardActionArea>

      <Stack spacing={0.75} sx={{ flexGrow: 1 }}>
        <Typography
          component={Link}
          href={`/cats/${cat.slug}`}
          sx={{
            fontFamily: 'var(--font-fraunces), Georgia, serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            textDecoration: 'none',
            color: 'text.primary',
          }}
        >
          {cat.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {namedRefName(cat.breed)} · {ageLabel(cat.ageMonths)} · {cat.gender}
        </Typography>
        <Typography sx={{ fontWeight: 600, mt: 'auto', pt: 1 }}>
          {formatMoney(cat.price, cat.currency)}
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
          {liked ? <FavoriteIcon color="secondary" fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </Button>
      </Stack>
    </Box>
  );
}
