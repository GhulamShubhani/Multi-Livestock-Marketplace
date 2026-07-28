'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Rating,
  Stack,
  Typography,
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { catalogApi } from '@/lib/api/catalog';
import { reviewApi, wishlistApi } from '@/lib/api/commerce';
import { ageLabel, namedRefName, primaryImage } from '@/lib/cat';
import { formatMoney } from '@/lib/utils';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useAuthStore } from '@/stores/auth';

export function CatDetail({ slug }: { slug: string }) {
  const catQuery = useQuery({
    queryKey: ['cat', slug],
    queryFn: () => catalogApi.getCatBySlug(slug),
  });

  const cat = catQuery.data?.data.cat;
  const reviewsQuery = useQuery({
    queryKey: ['reviews', cat?._id],
    queryFn: () => reviewApi.list({ catId: cat!._id, limit: 20 }),
    enabled: Boolean(cat?._id),
  });

  const addCart = useCartStore((s) => s.addItem);
  const wishHas = useWishlistStore((s) => s.has);
  const addWish = useWishlistStore((s) => s.addItem);
  const removeWish = useWishlistStore((s) => s.removeItem);
  const user = useAuthStore((s) => s.user);
  const [added, setAdded] = React.useState(false);

  if (catQuery.isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 16 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (catQuery.isError || !cat) {
    return (
      <Container sx={{ py: 10 }}>
        <Alert severity="error">This cat listing could not be found.</Alert>
      </Container>
    );
  }

  const image = primaryImage(cat.images);
  const liked = wishHas(cat._id);
  const reviews = reviewsQuery.data?.data.reviews ?? [];

  const onAddCart = () => {
    addCart({
      catId: cat._id,
      name: cat.name,
      slug: cat.slug,
      price: cat.price,
      currency: cat.currency,
      image,
      quantity: 1,
    });
    setAdded(true);
  };

  const toggleWish = async () => {
    const item = { catId: cat._id, name: cat.name, slug: cat.slug, price: cat.price, image };
    if (liked) {
      removeWish(cat._id);
      if (user) await wishlistApi.remove(cat._id).catch(() => addWish(item));
      return;
    }
    addWish(item);
    if (user) await wishlistApi.add(cat._id).catch(() => removeWish(cat._id));
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={5}>
        <Box
          sx={{
            flex: 1.1,
            aspectRatio: { md: '4 / 5' },
            minHeight: 320,
            overflow: 'hidden',
            backgroundColor: 'action.hover',
          }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : null}
        </Box>

        <Stack spacing={2} sx={{ flex: 1 }}>
          <Typography
            variant="h2"
            sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: { xs: '2rem', md: '3rem' } }}
          >
            {cat.name}
          </Typography>
          <Typography color="text.secondary">
            {namedRefName(cat.breed)} · {namedRefName(cat.category)} · {ageLabel(cat.ageMonths)} ·{' '}
            {cat.gender}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {cat.vaccinated ? <Chip label="Vaccinated" size="small" /> : null}
            {cat.neutered ? <Chip label="Neutered" size="small" /> : null}
            {cat.pedigree ? <Chip label="Pedigree" size="small" /> : null}
          </Stack>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 700 }}>
            {formatMoney(cat.price, cat.currency)}
          </Typography>
          {cat.compareAtPrice && cat.compareAtPrice > cat.price ? (
            <Typography color="text.secondary" sx={{ textDecoration: 'line-through' }}>
              {formatMoney(cat.compareAtPrice, cat.currency)}
            </Typography>
          ) : null}
          <Typography sx={{ lineHeight: 1.75, color: 'text.secondary' }}>
            {cat.description}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<ShoppingBagOutlinedIcon />}
              onClick={onAddCart}
            >
              {added ? 'Added to cart' : 'Add to cart'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              onClick={toggleWish}
            >
              {liked ? 'Saved' : 'Wishlist'}
            </Button>
          </Stack>
          {cat.reviewCount > 0 ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Rating value={cat.averageRating} precision={0.1} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                {cat.averageRating.toFixed(1)} · {cat.reviewCount} reviews
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </Stack>

      <Divider sx={{ my: 6 }} />
      <Typography variant="h4" sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', mb: 3 }}>
        Reviews
      </Typography>
      {reviews.length === 0 ? (
        <Typography color="text.secondary">No reviews yet.</Typography>
      ) : (
        <Stack spacing={3}>
          {reviews.map((r) => (
            <Box key={r._id}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                <Rating value={r.rating} readOnly size="small" />
                <Typography sx={{ fontWeight: 600 }}>
                  {r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Guest'}
                </Typography>
              </Stack>
              {r.title ? <Typography sx={{ fontWeight: 600 }}>{r.title}</Typography> : null}
              {r.body ? <Typography color="text.secondary">{r.body}</Typography> : null}
            </Box>
          ))}
        </Stack>
      )}
    </Container>
  );
}
