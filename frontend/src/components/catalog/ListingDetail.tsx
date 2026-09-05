'use client';

import * as React from 'react';
import Link from 'next/link';
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
  TextField,
  Typography,
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import MailOutlineIcon from '@mui/icons-material/MailOutlineOutlined';
import { catalogApi } from '@/lib/api/catalog';
import { enquiryApi, paymentApi, reviewApi, wishlistApi } from '@/lib/api/commerce';
import { ageLabel, categorySlugOf, locationLabel, namedRefName, primaryImage } from '@/lib/listing';
import { formatMoney } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api/client';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useAuthStore } from '@/stores/auth';
import type { MediaImage, MediaVideo } from '@/types/api';
import { ListingCard } from '@/components/catalog/ListingCard';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { OptimizedImage } from '@/components/media/OptimizedImage';
import { inferImageSourceType } from '@/lib/image-source';

type GalleryItem =
  | {
      kind: 'image';
      key: string;
      url: string;
      alt?: string;
      sourceType?: MediaImage['sourceType'];
      sourceLabel?: string;
    }
  | { kind: 'video'; key: string; url: string; alt?: string };

function buildGallery(images: MediaImage[] = [], videos: MediaVideo[] = []): GalleryItem[] {
  const sortedImages = [...images].sort(
    (a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)),
  );
  const imageItems: GalleryItem[] = sortedImages.map((img, i) => ({
    kind: 'image',
    key: img.publicId ?? `img-${i}-${img.url}`,
    url: img.url,
    alt: img.alt,
    sourceType: img.sourceType ?? inferImageSourceType(img.url),
    sourceLabel: img.sourceLabel,
  }));
  const videoItems: GalleryItem[] = videos.map((vid, i) => ({
    kind: 'video',
    key: vid.publicId ?? `vid-${i}-${vid.url}`,
    url: vid.url,
    alt: vid.alt,
  }));
  return [...imageItems, ...videoItems];
}

function digitsOnly(value?: string) {
  return (value ?? '').replace(/\D/g, '');
}

function sellerDisplayName(seller: unknown): string {
  if (!seller || typeof seller === 'string') return 'Seller';
  const s = seller as { firstName?: string; lastName?: string };
  const name = [s.firstName, s.lastName].filter(Boolean).join(' ').trim();
  return name || 'Seller';
}

function ListingDetailInner({ slug }: { slug: string }) {
  const listingQuery = useQuery({
    queryKey: ['listing', slug],
    queryFn: () => catalogApi.getListingBySlug(slug),
  });

  const listing = listingQuery.data?.data.listing;
  const categorySlug = listing ? categorySlugOf(listing) : undefined;

  const reviewsQuery = useQuery({
    queryKey: ['reviews', listing?._id],
    queryFn: () => reviewApi.list({ listingId: listing!._id, limit: 20 }),
    enabled: Boolean(listing?._id),
  });

  const similarQuery = useQuery({
    queryKey: ['listings', 'similar', categorySlug],
    queryFn: () =>
      catalogApi.listListings({ category: categorySlug, limit: 4, sort: '-createdAt' }),
    enabled: Boolean(categorySlug),
  });

  const paymentQuery = useQuery({
    queryKey: ['payments', 'methods'],
    queryFn: () => paymentApi.methods(),
    staleTime: 60_000,
  });

  const addCart = useCartStore((s) => s.addItem);
  const wishHas = useWishlistStore((s) => s.has);
  const addWish = useWishlistStore((s) => s.addItem);
  const removeWish = useWishlistStore((s) => s.removeItem);
  const user = useAuthStore((s) => s.user);
  const [added, setAdded] = React.useState(false);
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const [enquiryMsg, setEnquiryMsg] = React.useState(
    'I am interested in this animal. Please contact me.',
  );
  const [enquiryStatus, setEnquiryStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  );
  const [enquiryError, setEnquiryError] = React.useState<string | null>(null);

  const gallery = React.useMemo(
    () => (listing ? buildGallery(listing.images, listing.videos) : []),
    [listing],
  );

  React.useEffect(() => {
    if (!gallery.length) {
      setActiveKey(null);
      return;
    }
    setActiveKey((prev) => (prev && gallery.some((g) => g.key === prev) ? prev : gallery[0].key));
  }, [gallery]);

  if (listingQuery.isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 16 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (listingQuery.isError || !listing) {
    return (
      <Container sx={{ py: 10 }}>
        <Alert severity="error">
          This listing could not be found, or you may need to sign in again to view details.
        </Alert>
      </Container>
    );
  }

  const image = primaryImage(listing.images);
  const liked = wishHas(listing._id);
  const reviews = reviewsQuery.data?.data.reviews ?? [];
  const active = gallery.find((g) => g.key === activeKey) ?? gallery[0];
  const similar = (similarQuery.data?.data.listings ?? [])
    .filter((l) => l._id !== listing._id)
    .slice(0, 4);
  const tel = digitsOnly(listing.sellerMobile);
  const wa = digitsOnly(listing.sellerWhatsApp || listing.sellerMobile);
  const methods = paymentQuery.data?.data.methods;
  const listedAt = listing.createdAt
    ? new Date(listing.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const onAddCart = () => {
    addCart({
      listingId: listing._id,
      title: listing.title,
      slug: listing.slug,
      categorySlug: categorySlugOf(listing),
      price: listing.price,
      currency: listing.currency,
      image,
      quantity: 1,
    });
    setAdded(true);
  };

  const toggleWish = async () => {
    const item = {
      listingId: listing._id,
      title: listing.title,
      slug: listing.slug,
      categorySlug: categorySlugOf(listing),
      price: listing.price,
      image,
    };
    if (liked) {
      removeWish(listing._id);
      if (user) await wishlistApi.remove(listing._id).catch(() => addWish(item));
      return;
    }
    addWish(item);
    if (user) await wishlistApi.add(listing._id).catch(() => removeWish(listing._id));
  };

  const sendEnquiry = async (contactMethod: 'enquiry' | 'call' | 'whatsapp' | 'view_mobile') => {
    setEnquiryStatus('sending');
    setEnquiryError(null);
    try {
      await enquiryApi.create({
        listingId: listing._id,
        message: enquiryMsg,
        contactMethod,
        buyerName: user ? `${user.firstName} ${user.lastName}` : undefined,
        buyerEmail: user?.email,
        buyerPhone: user?.phone,
      });
      setEnquiryStatus('sent');
    } catch (e) {
      setEnquiryStatus('error');
      setEnquiryError(getApiErrorMessage(e, 'Could not send enquiry'));
    }
  };

  const specs: Array<[string, string]> = [
    ['Listing ID', listing.listingId],
    ['Category', namedRefName(listing.category)],
    ['Breed', namedRefName(listing.breed) || '—'],
    ['Age', ageLabel(listing.ageMonths) || '—'],
    ['Gender', listing.gender],
    ['Weight', listing.weight != null ? `${listing.weight} kg` : '—'],
    ['Health', listing.healthStatus || '—'],
    ['Vaccination', listing.vaccinationStatus || '—'],
    ['Location', locationLabel(listing.location) || '—'],
    ['Seller', sellerDisplayName(listing.seller)],
    ['Listed', listedAt || '—'],
    ['Availability', listing.availabilityStatus],
    ['Verification', listing.verificationStatus],
  ];

  if (listing.location) {
    const address = [
      listing.location.area,
      listing.location.village,
      listing.location.district,
      listing.location.city,
      listing.location.state,
      listing.location.pincode,
      listing.location.country,
    ]
      .filter(Boolean)
      .join(', ');
    if (address) specs.push(['Full address', address]);
  }

  if (listing.attributes) {
    for (const [key, value] of Object.entries(listing.attributes)) {
      if (value == null || value === '') continue;
      specs.push([key, String(value)]);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={5}>
        <Stack spacing={1.5} sx={{ flex: 1.1 }}>
          <Box
            sx={{
              position: 'relative',
              aspectRatio: { md: '4 / 5' },
              minHeight: 320,
              overflow: 'hidden',
              backgroundColor: 'action.hover',
            }}
          >
            {active?.kind === 'image' ? (
              <OptimizedImage
                src={active.url}
                alt={active.alt || listing.title}
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                priority
                sourceType={active.sourceType}
                sourceLabel={active.sourceLabel}
                showSourceBadge
              />
            ) : active?.kind === 'video' ? (
              <video
                key={active.url}
                src={active.url}
                controls
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }}
              />
            ) : null}
          </Box>

          {gallery.length > 1 ? (
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
              {gallery.map((item) => {
                const selected = item.key === active?.key;
                return (
                  <Box
                    key={item.key}
                    component="button"
                    type="button"
                    onClick={() => setActiveKey(item.key)}
                    aria-label={item.kind === 'video' ? 'Play video' : 'View image'}
                    sx={{
                      flex: '0 0 auto',
                      width: 84,
                      height: 64,
                      p: 0,
                      border: '2px solid',
                      borderColor: selected ? 'secondary.main' : 'divider',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      backgroundColor: 'action.hover',
                      position: 'relative',
                    }}
                  >
                    {item.kind === 'image' ? (
                      <OptimizedImage
                        src={item.url}
                        alt=""
                        fill
                        sizes="84px"
                        loading="lazy"
                        showSkeleton={false}
                      />
                    ) : (
                      <>
                        <video
                          src={item.url}
                          muted
                          preload="metadata"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            display: 'grid',
                            placeItems: 'center',
                            backgroundColor: 'rgba(0,0,0,0.35)',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                          }}
                        >
                          VIDEO
                        </Box>
                      </>
                    )}
                  </Box>
                );
              })}
            </Stack>
          ) : null}
        </Stack>

        <Stack spacing={2} sx={{ flex: 1 }}>
          <Typography
            variant="h2"
            sx={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            {listing.title}
          </Typography>
          <Typography color="text.secondary">
            {namedRefName(listing.breed)}
            {namedRefName(listing.breed) && namedRefName(listing.category) ? ' · ' : ''}
            {namedRefName(listing.category)}
            {ageLabel(listing.ageMonths) ? ` · ${ageLabel(listing.ageMonths)}` : ''}
            {` · ${listing.gender}`}
            {locationLabel(listing.location) ? ` · ${locationLabel(listing.location)}` : ''}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {listing.featured ? <Chip label="Featured" size="small" color="secondary" /> : null}
            {listing.verificationStatus === 'verified' ? (
              <Chip label="Verified seller" size="small" />
            ) : null}
            {listing.negotiable ? <Chip label="Negotiable" size="small" /> : null}
            <Chip label={listing.availabilityStatus} size="small" variant="outlined" />
          </Stack>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 700 }}>
            {formatMoney(listing.price, listing.currency)}
          </Typography>
          {listing.shortDescription ? (
            <Typography sx={{ lineHeight: 1.7, fontWeight: 500 }}>
              {listing.shortDescription}
            </Typography>
          ) : null}
          <Typography sx={{ lineHeight: 1.75, color: 'text.secondary' }}>
            {listing.description}
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

          <Divider sx={{ my: 1 }} />

          <Typography
            sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '1.25rem' }}
          >
            Contact seller
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reach {sellerDisplayName(listing.seller)} directly. Contact details are shown only to
            signed-in buyers.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {tel ? (
              <Button
                component="a"
                href={`tel:${tel}`}
                variant="outlined"
                startIcon={<CallOutlinedIcon />}
                onClick={() => void sendEnquiry('call')}
              >
                Call {listing.sellerMobile}
              </Button>
            ) : null}
            {wa ? (
              <Button
                component="a"
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                startIcon={<WhatsAppIcon />}
                onClick={() => void sendEnquiry('whatsapp')}
              >
                WhatsApp
              </Button>
            ) : null}
            {!tel && !wa ? (
              <Typography variant="body2" color="text.secondary">
                No direct phone listed — send an enquiry below.
              </Typography>
            ) : null}
          </Stack>

          <TextField
            label="Enquiry message"
            multiline
            minRows={2}
            value={enquiryMsg}
            onChange={(e) => setEnquiryMsg(e.target.value)}
          />
          {enquiryError ? <Alert severity="error">{enquiryError}</Alert> : null}
          {enquiryStatus === 'sent' ? (
            <Alert severity="success">Enquiry sent — the seller will get back to you.</Alert>
          ) : null}
          <Button
            variant="contained"
            startIcon={<MailOutlineIcon />}
            disabled={enquiryStatus === 'sending' || !enquiryMsg.trim()}
            onClick={() => void sendEnquiry('enquiry')}
            sx={{ alignSelf: 'flex-start' }}
          >
            {enquiryStatus === 'sending' ? 'Sending…' : 'Send enquiry'}
          </Button>

          <Divider sx={{ my: 1 }} />

          <Typography
            sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '1.25rem' }}
          >
            How payment works
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            Add the animal to your cart and checkout. Pay via UPI or bank transfer, then upload
            payment proof for verification. Sensitive bank details appear only during checkout.
          </Typography>
          {methods ? (
            <Stack spacing={0.75} sx={{ mt: 1 }}>
              {methods.upiId ? (
                <Typography variant="body2">
                  UPI available{methods.receiverName ? ` · ${methods.receiverName}` : ''}
                </Typography>
              ) : null}
              {methods.bankName ? (
                <Typography variant="body2">Bank transfer · {methods.bankName}</Typography>
              ) : null}
              {methods.instructions ? (
                <Typography variant="body2" color="text.secondary">
                  {methods.instructions}
                </Typography>
              ) : null}
              {(methods.providers ?? []).length > 0 ? (
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', pt: 0.5 }}>
                  {methods.providers!.map((p) => (
                    <Chip key={p} size="small" label={p.replace(/_/g, ' ')} variant="outlined" />
                  ))}
                </Stack>
              ) : null}
            </Stack>
          ) : null}

          {listing.reviewCount > 0 ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Rating value={listing.averageRating} precision={0.1} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                {listing.averageRating.toFixed(1)} · {listing.reviewCount} reviews
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </Stack>

      <Divider sx={{ my: 6 }} />
      <Typography variant="h4" sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', mb: 3 }}>
        Animal details
      </Typography>
      <Stack spacing={1.25} sx={{ mb: 6, maxWidth: 640 }}>
        {specs.map(([label, value]) => (
          <Stack key={label} direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
            <Typography color="text.secondary" sx={{ textTransform: 'capitalize' }}>
              {label}
            </Typography>
            <Typography sx={{ fontWeight: 600, textAlign: 'right' }}>{value}</Typography>
          </Stack>
        ))}
      </Stack>

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

      {similar.length > 0 ? (
        <>
          <Divider sx={{ my: 6 }} />
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 3 }}
          >
            <Typography variant="h4" sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
              Similar animals
            </Typography>
            {categorySlug ? (
              <Button component={Link} href={`/animals/${categorySlug}`} color="secondary">
                See more
              </Button>
            ) : null}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            {similar.map((item) => (
              <Box key={item._id} sx={{ flex: 1, minWidth: 0 }}>
                <ListingCard listing={item} />
              </Box>
            ))}
          </Stack>
        </>
      ) : null}
    </Container>
  );
}

export function ListingDetail({ slug }: { slug: string }) {
  return (
    <RequireAuth loadingLabel="Verifying access to listing details…">
      <ListingDetailInner slug={slug} />
    </RequireAuth>
  );
}
