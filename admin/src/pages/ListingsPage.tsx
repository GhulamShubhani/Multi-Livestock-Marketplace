import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  Typography,
  TableCell,
  TableRow,
  TextField,
  Chip,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { useSnackbar } from 'notistack';
import { catalogApi, type AttributeAdmin, type ListingAdmin } from '@/lib/api/catalog';
import { uploadsApi, type MediaAsset } from '@/lib/api/uploads';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatMoney, hasPermission, idOf, namedRef } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { PageHeader, PrimaryAction } from '@/components/common/PageHeader';
import { DataTableShell } from '@/components/common/DataTableShell';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

const AVAILABILITY = ['draft', 'available', 'reserved', 'sold', 'archived'];
const VERIFICATION = ['unverified', 'pending', 'verified', 'rejected'];

const emptyForm = {
  title: '',
  description: '',
  breed: '',
  category: '',
  ageMonths: 12,
  gender: 'unknown',
  price: 10000,
  negotiable: false,
  currency: 'INR',
  sellerMobile: '',
  sellerWhatsApp: '',
  country: '',
  state: '',
  district: '',
  city: '',
  village: '',
  area: '',
  pincode: '',
  weight: '',
  healthStatus: '',
  vaccinationStatus: '',
  availabilityStatus: 'draft',
  featured: false,
  premium: false,
  isActive: true,
};

function verificationColor(status: string): 'default' | 'warning' | 'success' | 'error' {
  if (status === 'verified') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'rejected') return 'error';
  return 'default';
}

function renderAttributeField(
  attr: AttributeAdmin,
  value: unknown,
  onChange: (key: string, next: unknown) => void,
) {
  const label = `${attr.label || attr.name}${attr.unit ? ` (${attr.unit})` : ''}`;
  const key = attr.key;

  if (attr.type === 'boolean' || attr.type === 'yes_no') {
    return (
      <FormControlLabel
        key={key}
        control={
          <Switch checked={Boolean(value)} onChange={(e) => onChange(key, e.target.checked)} />
        }
        label={label}
      />
    );
  }

  if (attr.type === 'textarea') {
    return (
      <TextField
        key={key}
        label={label}
        multiline
        minRows={2}
        required={attr.required}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(key, e.target.value)}
      />
    );
  }

  if (attr.type === 'select' || attr.type === 'radio') {
    return (
      <TextField
        key={key}
        select
        label={label}
        required={attr.required}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(key, e.target.value)}
      >
        <MenuItem value="">—</MenuItem>
        {(attr.options ?? []).map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  if (attr.type === 'multiselect') {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    return (
      <TextField
        key={key}
        select
        label={label}
        required={attr.required}
        slotProps={{
          select: {
            multiple: true,
            renderValue: (selectedVals: unknown) => (selectedVals as string[]).join(', '),
          },
        }}
        value={selected}
        onChange={(e) => {
          const next = e.target.value;
          onChange(key, typeof next === 'string' ? next.split(',') : next);
        }}
      >
        {(attr.options ?? []).map((opt) => (
          <MenuItem key={opt} value={opt}>
            <Checkbox checked={selected.includes(opt)} size="small" />
            {opt}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  if (attr.type === 'number' || attr.type === 'decimal') {
    return (
      <TextField
        key={key}
        type="number"
        label={label}
        required={attr.required}
        value={value === undefined || value === null ? '' : String(value)}
        onChange={(e) => onChange(key, e.target.value === '' ? '' : Number(e.target.value))}
      />
    );
  }

  if (attr.type === 'date') {
    return (
      <TextField
        key={key}
        type="date"
        label={label}
        required={attr.required}
        slotProps={{ inputLabel: { shrink: true } }}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(key, e.target.value)}
      />
    );
  }

  return (
    <TextField
      key={key}
      label={label}
      required={attr.required}
      value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
      onChange={(e) => onChange(key, e.target.value)}
    />
  );
}

export function ListingsPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const perms = useAuthStore((s) => s.user?.permissions);
  const canCreate = hasPermission(perms, 'listings:create');
  const canUpdate = hasPermission(perms, 'listings:update');
  const canDelete = hasPermission(perms, 'listings:delete');
  const canVerify = hasPermission(perms, 'listings:verify');

  const MAX_TOTAL_MEDIA = 10;
  const MAX_IMAGES = 5;
  const MAX_VIDEOS = 5;
  const existingImages = (listing: ListingAdmin | null) =>
    (listing?.images ?? []) as NonNullable<ListingAdmin['images']>[number][];
  const existingVideos = (listing: ListingAdmin | null) =>
    (listing?.videos ?? []) as NonNullable<NonNullable<ListingAdmin['videos']>>[number][];

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ListingAdmin | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [attrValues, setAttrValues] = useState<Record<string, unknown>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<
    (MediaAsset & { alt?: string; isPrimary?: boolean }) | null
  >(null);
  const [additionalImages, setAdditionalImages] = useState<
    (MediaAsset & { alt?: string; isPrimary?: boolean })[]
  >([]);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingMore, setUploadingMore] = useState(false);
  const [additionalVideos, setAdditionalVideos] = useState<(MediaAsset & { alt?: string })[]>([]);
  const [uploadingVideos, setUploadingVideos] = useState(false);

  const resetMedia = () => {
    setMainImage(null);
    setAdditionalImages([]);
    setAdditionalVideos([]);
    setUploadingMain(false);
    setUploadingMore(false);
    setUploadingVideos(false);
  };

  const setMainFromImage = (img: MediaAsset & { alt?: string; isPrimary?: boolean }) => {
    setAdditionalImages((prev) => {
      const prevPrimary = mainImage;
      const withoutSelected = prev.filter((i) => i.publicId !== img.publicId);
      return prevPrimary
        ? [...withoutSelected, { ...prevPrimary, isPrimary: false }]
        : withoutSelected;
    });
    setMainImage(img);
  };

  const payloadImages = () => {
    const main = mainImage ? [{ ...mainImage, isPrimary: true }] : [];
    const rest = additionalImages.map((i) => ({ ...i, isPrimary: false }));
    const out = [...main, ...rest];
    if (out.length === 0) return undefined;
    return out.map((i) => ({
      url: i.url,
      publicId: i.publicId,
      isPrimary: i.isPrimary,
      alt: i.alt,
    }));
  };

  const payloadVideos = () => {
    if (!additionalVideos.length) return undefined;
    return additionalVideos.map((v) => ({ url: v.url, publicId: v.publicId, alt: v.alt }));
  };

  const mediaCount = (mainImage ? 1 : 0) + additionalImages.length + additionalVideos.length;
  const remainingTotal = Math.max(0, MAX_TOTAL_MEDIA - mediaCount);
  const remainingImagesAllowed = Math.max(
    0,
    MAX_IMAGES - (mainImage ? 1 : 0) - additionalImages.length,
  );
  const remainingVideosAllowed = Math.max(0, MAX_VIDEOS - additionalVideos.length);
  const remainingImages = Math.min(remainingTotal, remainingImagesAllowed);
  const remainingVideos = Math.min(remainingTotal, remainingVideosAllowed);

  const query = useQuery({
    queryKey: ['admin-listings', page, q, availabilityStatus, verificationStatus],
    queryFn: () =>
      catalogApi.listListings({
        page,
        limit: 20,
        q: q || undefined,
        status: availabilityStatus || undefined,
        availabilityStatus: availabilityStatus || undefined,
        verificationStatus: verificationStatus || undefined,
      }),
  });

  const breeds = useQuery({
    queryKey: ['admin-breeds-options'],
    queryFn: () => catalogApi.listBreeds({ limit: 100 }),
  });
  const categories = useQuery({
    queryKey: ['admin-categories-options'],
    queryFn: () => catalogApi.listCategories({ limit: 100 }),
  });

  const categoryAttributes = useQuery({
    queryKey: ['category-attributes', form.category],
    queryFn: () => catalogApi.listAttributesByCategory(form.category),
    enabled: Boolean(form.category),
  });

  useEffect(() => {
    if (!form.category) {
      setAttrValues({});
    }
  }, [form.category]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.country || !form.state || !form.district || !form.city) {
        throw new Error('Country, state, district, and city are required');
      }
      const images = payloadImages();
      const videos = payloadVideos();
      const body: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        category: form.category,
        breed: form.breed || undefined,
        ageMonths: Number(form.ageMonths),
        gender: form.gender,
        price: Number(form.price),
        negotiable: form.negotiable,
        currency: form.currency,
        sellerMobile: form.sellerMobile || undefined,
        sellerWhatsApp: form.sellerWhatsApp || undefined,
        location: {
          country: form.country,
          state: form.state,
          district: form.district,
          city: form.city,
          village: form.village || undefined,
          area: form.area || undefined,
          pincode: form.pincode || undefined,
        },
        weight: form.weight === '' ? undefined : Number(form.weight),
        healthStatus: form.healthStatus || undefined,
        vaccinationStatus: form.vaccinationStatus || undefined,
        availabilityStatus: form.availabilityStatus,
        featured: form.featured,
        premium: form.premium,
        isActive: form.isActive,
        attributes: attrValues,
        ...(images ? { images } : {}),
        ...(videos ? { videos } : {}),
      };
      if (editing) return catalogApi.updateListing(editing._id, body);
      return catalogApi.createListing(body);
    },
    onSuccess: async () => {
      enqueueSnackbar(editing ? 'Listing updated' : 'Listing created', { variant: 'success' });
      setOpen(false);
      setEditing(null);
      await qc.invalidateQueries({ queryKey: ['admin-listings'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) =>
      catalogApi.setListingStatus(id, next),
    onSuccess: async () => {
      enqueueSnackbar('Availability updated', { variant: 'success' });
      await qc.invalidateQueries({ queryKey: ['admin-listings'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) => catalogApi.verifyListing(id, next),
    onSuccess: async () => {
      enqueueSnackbar('Verification updated', { variant: 'success' });
      await qc.invalidateQueries({ queryKey: ['admin-listings'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogApi.deleteListing(id),
    onSuccess: async () => {
      enqueueSnackbar('Listing deleted', { variant: 'success' });
      setDeleteId(null);
      await qc.invalidateQueries({ queryKey: ['admin-listings'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const listings = query.data?.data.listings ?? [];
  const meta = query.data?.meta;
  const dynamicAttrs = categoryAttributes.data?.data.attributes ?? [];

  const columns = useMemo(
    () => [
      { key: 'title', label: 'Listing' },
      { key: 'category', label: 'Category' },
      { key: 'price', label: 'Price', align: 'right' as const },
      { key: 'availability', label: 'Availability' },
      { key: 'verification', label: 'Verification' },
      { key: 'actions', label: '', align: 'right' as const },
    ],
    [],
  );

  const openEdit = (listing: ListingAdmin) => {
    setEditing(listing);
    setForm({
      title: listing.title,
      description: listing.description,
      breed: idOf(listing.breed),
      category: idOf(listing.category),
      ageMonths: listing.ageMonths ?? 12,
      gender: listing.gender,
      price: listing.price,
      negotiable: Boolean(listing.negotiable),
      currency: listing.currency || 'INR',
      sellerMobile: listing.sellerMobile ?? '',
      sellerWhatsApp: listing.sellerWhatsApp ?? '',
      country: listing.location?.country ?? '',
      state: listing.location?.state ?? '',
      district: listing.location?.district ?? '',
      city: listing.location?.city ?? '',
      village: listing.location?.village ?? '',
      area: listing.location?.area ?? '',
      pincode: listing.location?.pincode ?? '',
      weight: listing.weight != null ? String(listing.weight) : '',
      healthStatus: listing.healthStatus ?? '',
      vaccinationStatus: listing.vaccinationStatus ?? '',
      availabilityStatus: listing.availabilityStatus,
      featured: listing.featured,
      premium: Boolean(listing.premium),
      isActive: listing.isActive !== false,
    });
    setAttrValues(listing.attributes ?? {});
    const images = existingImages(listing);
    const primary = images.find((i) => i.isPrimary) ?? images[0];
    setMainImage(
      primary
        ? {
            url: primary.url,
            publicId: primary.publicId,
            alt: primary.alt,
            isPrimary: true,
          }
        : null,
    );
    setAdditionalImages(
      primary
        ? images
            .filter((i) => i.publicId !== primary.publicId)
            .map((i) => ({
              url: i.url,
              publicId: i.publicId,
              alt: i.alt,
              isPrimary: false,
            }))
        : images.map((i) => ({
            url: i.url,
            publicId: i.publicId,
            alt: i.alt,
            isPrimary: false,
          })),
    );
    setAdditionalVideos(
      existingVideos(listing).map((v) => ({
        url: v.url,
        publicId: v.publicId,
        alt: v.alt,
      })),
    );
    setOpen(true);
  };

  return (
    <>
      <PageHeader
        title="All Listings"
        description="Manage livestock marketplace listings, availability, and verification."
        action={
          canCreate ? (
            <PrimaryAction
              label="Add listing"
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
                setAttrValues({});
                resetMedia();
                setOpen(true);
              }}
            />
          ) : null
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Search"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
        <TextField
          select
          size="small"
          label="Availability"
          value={availabilityStatus}
          onChange={(e) => {
            setPage(1);
            setAvailabilityStatus(e.target.value);
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          {AVAILABILITY.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Verification"
          value={verificationStatus}
          onChange={(e) => {
            setPage(1);
            setVerificationStatus(e.target.value);
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          {VERIFICATION.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <DataTableShell
        columns={columns}
        loading={query.isLoading}
        error={query.isError ? getApiErrorMessage(query.error) : null}
        page={meta?.page}
        totalPages={meta?.totalPages}
        onPageChange={setPage}
      >
        {listings.map((listing) => (
          <TableRow key={listing._id} hover>
            <TableCell>
              {listing.title}
              {listing.featured ? (
                <Chip size="small" label="Featured" sx={{ ml: 1 }} color="secondary" />
              ) : null}
            </TableCell>
            <TableCell>{namedRef(listing.category)}</TableCell>
            <TableCell align="right">{formatMoney(listing.price, listing.currency)}</TableCell>
            <TableCell>
              {canUpdate ? (
                <TextField
                  select
                  size="small"
                  value={listing.availabilityStatus}
                  onChange={(e) => statusMutation.mutate({ id: listing._id, next: e.target.value })}
                  sx={{ minWidth: 120 }}
                >
                  {AVAILABILITY.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                listing.availabilityStatus
              )}
            </TableCell>
            <TableCell>
              <Chip
                size="small"
                label={listing.verificationStatus}
                color={verificationColor(listing.verificationStatus)}
              />
              {canVerify ? (
                <IconButton
                  size="small"
                  title="Verify"
                  onClick={() =>
                    verifyMutation.mutate({
                      id: listing._id,
                      next: listing.verificationStatus === 'verified' ? 'pending' : 'verified',
                    })
                  }
                >
                  <VerifiedOutlinedIcon fontSize="small" />
                </IconButton>
              ) : null}
            </TableCell>
            <TableCell align="right">
              {canUpdate ? (
                <IconButton size="small" onClick={() => openEdit(listing)}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              ) : null}
              {canDelete ? (
                <IconButton size="small" onClick={() => setDeleteId(listing._id)}>
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? 'Edit listing' : 'Add listing'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <TextField
              label="Description"
              required
              multiline
              minRows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                select
                label="Category"
                required
                value={form.category}
                onChange={(e) => {
                  setForm((f) => ({ ...f, category: e.target.value }));
                  setAttrValues({});
                }}
              >
                {(categories.data?.data.categories ?? []).map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Breed"
                value={form.breed}
                onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))}
              >
                <MenuItem value="">—</MenuItem>
                {(breeds.data?.data.breeds ?? []).map((b) => (
                  <MenuItem key={b._id} value={b._id}>
                    {b.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Typography variant="subtitle2">Location</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                required
                label="Country"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
              <TextField
                fullWidth
                required
                label="State"
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                required
                label="District"
                value={form.district}
                onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
              />
              <TextField
                fullWidth
                required
                label="City"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Village"
                value={form.village}
                onChange={(e) => setForm((f) => ({ ...f, village: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Area"
                value={form.area}
                onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Pincode"
                value={form.pincode}
                onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Seller mobile"
                value={form.sellerMobile}
                onChange={(e) => setForm((f) => ({ ...f, sellerMobile: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Seller WhatsApp"
                value={form.sellerWhatsApp}
                onChange={(e) => setForm((f) => ({ ...f, sellerWhatsApp: e.target.value }))}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                type="number"
                label="Age (months)"
                value={form.ageMonths}
                onChange={(e) => setForm((f) => ({ ...f, ageMonths: Number(e.target.value) }))}
              />
              <TextField
                fullWidth
                select
                label="Gender"
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
              >
                {['male', 'female', 'unknown'].map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                type="number"
                label="Weight"
                value={form.weight}
                onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                type="number"
                label="Price (minor units)"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              />
              <TextField
                fullWidth
                label="Currency"
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              />
              <TextField
                fullWidth
                select
                label="Availability"
                value={form.availabilityStatus}
                onChange={(e) => setForm((f) => ({ ...f, availabilityStatus: e.target.value }))}
              >
                {AVAILABILITY.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Health status"
                value={form.healthStatus}
                onChange={(e) => setForm((f) => ({ ...f, healthStatus: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Vaccination status"
                value={form.vaccinationStatus}
                onChange={(e) => setForm((f) => ({ ...f, vaccinationStatus: e.target.value }))}
              />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.negotiable}
                    onChange={(e) => setForm((f) => ({ ...f, negotiable: e.target.checked }))}
                  />
                }
                label="Negotiable"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  />
                }
                label="Featured"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.premium}
                    onChange={(e) => setForm((f) => ({ ...f, premium: e.target.checked }))}
                  />
                }
                label="Premium"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                }
                label="Active"
              />
            </Stack>

            {form.category ? (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Category attributes
                </Typography>
                {categoryAttributes.isLoading ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading attributes…
                  </Typography>
                ) : dynamicAttrs.length ? (
                  <Stack spacing={2}>
                    {dynamicAttrs.map((attr) =>
                      renderAttributeField(attr, attrValues[attr.key], (key, next) =>
                        setAttrValues((prev) => ({ ...prev, [key]: next })),
                      ),
                    )}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No attributes for this category.
                  </Typography>
                )}
              </Box>
            ) : null}

            <Box sx={{ mt: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Media
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Uploads accept images + videos. Limit: up to {MAX_IMAGES} images + {MAX_VIDEOS}{' '}
                videos (total max {MAX_TOTAL_MEDIA}).
              </Alert>

              <Stack spacing={2}>
                <Box sx={{ border: '1px dashed', borderColor: 'divider', p: 2 }}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <ImageOutlinedIcon color="action" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>Main image (primary)</Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      component="label"
                      disabled={
                        uploadingMain || uploadingMore || (!mainImage && remainingImages <= 0)
                      }
                    >
                      {uploadingMain ? 'Uploading…' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingMain(true);
                          try {
                            const uploaded = await uploadsApi.uploadMainImage(file);
                            setMainImage({ ...uploaded, isPrimary: true });
                            enqueueSnackbar('Main image uploaded', { variant: 'success' });
                          } catch (err) {
                            enqueueSnackbar(getApiErrorMessage(err), { variant: 'error' });
                          } finally {
                            setUploadingMain(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </Button>
                  </Stack>
                  {mainImage ? (
                    <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 110,
                          height: 80,
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <img
                          src={mainImage.url}
                          alt="Main"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                      <Button size="small" color="error" onClick={() => setMainImage(null)}>
                        Remove main
                      </Button>
                    </Box>
                  ) : null}
                </Box>

                <Box sx={{ border: '1px dashed', borderColor: 'divider', p: 2 }}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <ImageOutlinedIcon color="action" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>Additional images</Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      component="label"
                      disabled={uploadingMore || uploadingMain || remainingImages <= 0}
                    >
                      {uploadingMore ? 'Uploading…' : `Upload (up to ${remainingImages})`}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                          const files = Array.from(e.target.files ?? []);
                          if (!files.length) return;
                          const toUpload = files.slice(0, remainingImages);
                          setUploadingMore(true);
                          try {
                            const uploaded = await uploadsApi.uploadImages(toUpload);
                            setAdditionalImages((prev) => [
                              ...prev,
                              ...uploaded.map((u) => ({ ...u, isPrimary: false })),
                            ]);
                            enqueueSnackbar(`Uploaded ${uploaded.length} image(s)`, {
                              variant: 'success',
                            });
                          } catch (err) {
                            enqueueSnackbar(getApiErrorMessage(err), { variant: 'error' });
                          } finally {
                            setUploadingMore(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </Button>
                  </Stack>
                  {additionalImages.length ? (
                    <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                      {additionalImages.map((img) => (
                        <Box key={img.publicId} sx={{ textAlign: 'center' }}>
                          <Box
                            sx={{
                              width: 110,
                              height: 80,
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'divider',
                              cursor: 'pointer',
                            }}
                            onClick={() => setMainFromImage(img)}
                          >
                            <img
                              src={img.url}
                              alt="Additional"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                          <Button
                            size="small"
                            color="error"
                            onClick={() =>
                              setAdditionalImages((prev) =>
                                prev.filter((p) => p.publicId !== img.publicId),
                              )
                            }
                          >
                            Remove
                          </Button>
                        </Box>
                      ))}
                    </Stack>
                  ) : null}
                </Box>

                <Box sx={{ border: '1px dashed', borderColor: 'divider', p: 2 }}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <VideocamOutlinedIcon color="action" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>Videos</Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      component="label"
                      disabled={uploadingVideos || remainingVideos <= 0}
                    >
                      {uploadingVideos ? 'Uploading…' : `Upload (up to ${remainingVideos})`}
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        hidden
                        onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                          const files = Array.from(e.target.files ?? []);
                          if (!files.length) return;
                          const toUpload = files.slice(0, remainingVideos);
                          setUploadingVideos(true);
                          try {
                            const uploaded = await uploadsApi.uploadVideos(toUpload);
                            setAdditionalVideos((prev) => [...prev, ...uploaded]);
                            enqueueSnackbar(`Uploaded ${uploaded.length} video(s)`, {
                              variant: 'success',
                            });
                          } catch (err) {
                            enqueueSnackbar(getApiErrorMessage(err), { variant: 'error' });
                          } finally {
                            setUploadingVideos(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </Button>
                  </Stack>
                  {additionalVideos.length ? (
                    <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                      {additionalVideos.map((vid) => (
                        <Box key={vid.publicId}>
                          <Box
                            sx={{
                              width: 110,
                              height: 80,
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <video
                              src={vid.url}
                              muted
                              preload="metadata"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                          <Button
                            size="small"
                            color="error"
                            onClick={() =>
                              setAdditionalVideos((prev) =>
                                prev.filter((p) => p.publicId !== vid.publicId),
                              )
                            }
                          >
                            Remove
                          </Button>
                        </Box>
                      ))}
                    </Stack>
                  ) : null}
                </Box>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              void saveMutation.mutate();
            }}
            disabled={saveMutation.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete listing"
        description="This permanently removes the listing."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </>
  );
}
