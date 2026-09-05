'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, Container, IconButton, Stack, Typography } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useAuthStore } from '@/stores/auth';
import { useWishlistStore } from '@/stores/wishlist';
import { wishlistApi } from '@/lib/api/commerce';
import { formatMoney } from '@/lib/utils';
import { categorySlugOf, primaryImage } from '@/lib/listing';
import type { WishlistItemLocal } from '@/types/api';

export function WishlistPageView() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const localItems = useWishlistStore((s) => s.items);
  const removeLocal = useWishlistStore((s) => s.removeItem);
  const clearLocal = useWishlistStore((s) => s.clear);
  const addLocal = useWishlistStore((s) => s.addItem);

  const remote = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.get(),
    enabled: Boolean(user),
  });

  React.useEffect(() => {
    if (!remote.data?.data.wishlist) return;
    clearLocal();
    for (const entry of remote.data.data.wishlist.items) {
      const listing = entry.listing;
      if (!listing?._id) continue;
      addLocal({
        listingId: listing._id,
        title: listing.title,
        slug: listing.slug,
        categorySlug: categorySlugOf(listing),
        price: listing.price,
        image: primaryImage(listing.images),
      });
    }
  }, [remote.data, clearLocal, addLocal]);

  const items: WishlistItemLocal[] = user
    ? (remote.data?.data.wishlist.items ?? []).map((e) => ({
        listingId: e.listing._id,
        title: e.listing.title,
        slug: e.listing.slug,
        categorySlug: categorySlugOf(e.listing),
        price: e.listing.price,
        image: primaryImage(e.listing.images),
      }))
    : localItems;

  const remove = async (listingId: string) => {
    removeLocal(listingId);
    if (user) {
      try {
        await wishlistApi.remove(listingId);
        await remote.refetch();
      } catch {
        // keep optimistic local remove
      }
    }
  };

  if (status === 'loading') {
    return <Container sx={{ py: 10 }} />;
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Typography
        variant="h2"
        sx={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontSize: { xs: '2rem', md: '2.6rem' },
          mb: 4,
        }}
      >
        Favorites
      </Typography>

      {!user ? (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Saved on this device. <Link href="/auth/login?next=/wishlist">Sign in</Link> to sync
          across devices.
        </Typography>
      ) : null}

      {items.length === 0 ? (
        <Stack spacing={2}>
          <Typography color="text.secondary">No saved animals yet.</Typography>
          <Button
            component={Link}
            href="/animals"
            variant="contained"
            sx={{ alignSelf: 'flex-start' }}
          >
            Browse animals
          </Button>
        </Stack>
      ) : (
        <Stack spacing={2}>
          {items.map((item) => {
            const href = item.categorySlug
              ? `/animals/${item.categorySlug}/${item.slug}`
              : `/animals/${item.slug}`;
            return (
              <Stack
                key={item.listingId}
                direction="row"
                spacing={2}
                sx={{
                  alignItems: 'center',
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    overflow: 'hidden',
                    backgroundColor: 'action.hover',
                  }}
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : null}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    component={Link}
                    href={href}
                    sx={{ fontWeight: 600, textDecoration: 'none', color: 'text.primary' }}
                  >
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary">{formatMoney(item.price)}</Typography>
                </Box>
                <IconButton aria-label="Remove" onClick={() => void remove(item.listingId)}>
                  <DeleteOutlinedIcon />
                </IconButton>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}
