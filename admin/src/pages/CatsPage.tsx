import { useMemo, useState, type ChangeEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Box,
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
import { useSnackbar } from 'notistack';
import { catalogApi, type CatAdmin } from '@/lib/api/catalog';
import { uploadsApi, type MediaAsset } from '@/lib/api/uploads';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatMoney, hasPermission, namedRef } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { PageHeader, PrimaryAction } from '@/components/common/PageHeader';
import { DataTableShell } from '@/components/common/DataTableShell';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

const STATUSES = ['draft', 'available', 'reserved', 'sold', 'archived'];

const emptyForm = {
  name: '',
  description: '',
  breed: '',
  category: '',
  ageMonths: 12,
  gender: 'unknown',
  price: 10000,
  stock: 1,
  status: 'draft',
  featured: false,
};

export function CatsPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const perms = useAuthStore((s) => s.user?.permissions);
  const canCreate = hasPermission(perms, 'cats:create');
  const canUpdate = hasPermission(perms, 'cats:update');
  const canDelete = hasPermission(perms, 'cats:delete');

  const MAX_TOTAL_MEDIA = 10;
  const MAX_IMAGES = 5;
  const MAX_VIDEOS = 5;
  const existingCatImages = (cat: CatAdmin | null) =>
    (cat?.images ?? []) as NonNullable<CatAdmin['images']>[number][];
  const existingCatVideos = (cat: CatAdmin | null) =>
    (cat?.videos ?? []) as NonNullable<NonNullable<CatAdmin['videos']>>[number][];

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CatAdmin | null>(null);
  const [form, setForm] = useState(emptyForm);
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
    // When selecting a new primary image, move the previous primary into additional.
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
    queryKey: ['admin-cats', page, q, status],
    queryFn: () =>
      catalogApi.listCats({
        page,
        limit: 20,
        q: q || undefined,
        status: status || undefined,
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

  const saveMutation = useMutation({
    mutationFn: async () => {
      const images = payloadImages();
      const videos = payloadVideos();
      const body = {
        name: form.name,
        description: form.description,
        breed: form.breed,
        category: form.category,
        ageMonths: Number(form.ageMonths),
        gender: form.gender,
        price: Number(form.price),
        stock: Number(form.stock),
        status: form.status,
        featured: form.featured,
        ...(images ? { images } : {}),
        ...(videos ? { videos } : {}),
      };
      if (editing) return catalogApi.updateCat(editing._id, body);
      return catalogApi.createCat(body);
    },
    onSuccess: async () => {
      enqueueSnackbar(editing ? 'Cat updated' : 'Cat created', { variant: 'success' });
      setOpen(false);
      setEditing(null);
      await qc.invalidateQueries({ queryKey: ['admin-cats'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) => catalogApi.setCatStatus(id, next),
    onSuccess: async () => {
      enqueueSnackbar('Status updated', { variant: 'success' });
      await qc.invalidateQueries({ queryKey: ['admin-cats'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogApi.deleteCat(id),
    onSuccess: async () => {
      enqueueSnackbar('Cat deleted', { variant: 'success' });
      setDeleteId(null);
      await qc.invalidateQueries({ queryKey: ['admin-cats'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const cats = query.data?.data.cats ?? [];
  const meta = query.data?.meta;

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Cat' },
      { key: 'breed', label: 'Breed' },
      { key: 'price', label: 'Price', align: 'right' as const },
      { key: 'status', label: 'Status' },
      { key: 'actions', label: '', align: 'right' as const },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Cats"
        description="Manage catalog listings, stock, and availability."
        action={
          canCreate ? (
            <PrimaryAction
              label="Add cat"
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
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
          label="Status"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          {STATUSES.map((s) => (
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
        {cats.map((cat) => (
          <TableRow key={cat._id} hover>
            <TableCell>
              {cat.name}
              {cat.featured ? (
                <Chip size="small" label="Featured" sx={{ ml: 1 }} color="secondary" />
              ) : null}
            </TableCell>
            <TableCell>{namedRef(cat.breed)}</TableCell>
            <TableCell align="right">{formatMoney(cat.price, cat.currency)}</TableCell>
            <TableCell>
              {canUpdate ? (
                <TextField
                  select
                  size="small"
                  value={cat.status}
                  onChange={(e) => statusMutation.mutate({ id: cat._id, next: e.target.value })}
                  sx={{ minWidth: 120 }}
                >
                  {STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                cat.status
              )}
            </TableCell>
            <TableCell align="right">
              {canUpdate ? (
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditing(cat);
                    setForm({
                      name: cat.name,
                      description: cat.description,
                      breed: typeof cat.breed === 'string' ? cat.breed : cat.breed._id,
                      category: typeof cat.category === 'string' ? cat.category : cat.category._id,
                      ageMonths: cat.ageMonths,
                      gender: cat.gender,
                      price: cat.price,
                      stock: cat.stock,
                      status: cat.status,
                      featured: cat.featured,
                    });
                    const images = existingCatImages(cat);
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
                    const vids = existingCatVideos(cat);
                    setAdditionalVideos(
                      vids.map((v) => ({ url: v.url, publicId: v.publicId, alt: v.alt })),
                    );
                    setOpen(true);
                  }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              ) : null}
              {canDelete ? (
                <IconButton size="small" onClick={() => setDeleteId(cat._id)}>
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit cat' : 'Add cat'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <TextField
              label="Description"
              multiline
              minRows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <TextField
              select
              label="Breed"
              value={form.breed}
              onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))}
              helperText={
                !breeds.data?.data.breeds?.length
                  ? 'No breeds yet — add some under Catalog → Breeds (or restart API to seed defaults).'
                  : undefined
              }
            >
              {(breeds.data?.data.breeds ?? []).map((b) => (
                <MenuItem key={b._id} value={b._id}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              helperText={
                !categories.data?.data.categories?.length
                  ? 'No categories yet — add some under Catalog → Categories (or restart API to seed defaults).'
                  : undefined
              }
            >
              {(categories.data?.data.categories ?? []).map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
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
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                type="number"
                label="Price (cents)"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              />
              <TextField
                fullWidth
                type="number"
                label="Stock"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
              />
            </Stack>
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                />
              }
              label="Featured"
            />

            <Box sx={{ mt: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Media
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Backend uploads accept <strong>images + videos</strong> (JPEG/PNG/WebP, and
                MP4/WebM/MOV). Limit: up to {MAX_IMAGES} images + {MAX_VIDEOS} videos (total max{' '}
                {MAX_TOTAL_MEDIA}). All media are optional.
              </Alert>

              <Stack spacing={2}>
                <Box sx={{ border: '1px dashed', borderColor: 'divider', p: 2 }}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <ImageOutlinedIcon color="action" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>Main image (primary)</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Upload 1 image; it will be marked as primary.
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      component="label"
                      disabled={
                        uploadingMain || uploadingMore || (!mainImage && remainingImages <= 0)
                      }
                      sx={{ whiteSpace: 'nowrap' }}
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
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                          {/* eslint-disable-next-line @next/next/no-img-element */}
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
                    </Box>
                  ) : null}
                </Box>

                <Box sx={{ border: '1px dashed', borderColor: 'divider', p: 2 }}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <ImageOutlinedIcon color="action" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>Additional images</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Up to {remainingImages} more images (max {MAX_IMAGES}). Total media max:{' '}
                        {MAX_TOTAL_MEDIA}.
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      component="label"
                      disabled={uploadingMore || uploadingMain || remainingImages <= 0}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {uploadingMore ? 'Uploading…' : `Upload images (up to ${remainingImages})`}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                          const files = Array.from(e.target.files ?? []);
                          if (!files.length) return;

                          const remaining = remainingImages;
                          if (remaining <= 0) {
                            enqueueSnackbar(
                              `You can only attach up to ${MAX_IMAGES} images and ${MAX_VIDEOS} videos (total ${MAX_TOTAL_MEDIA}).`,
                              {
                                variant: 'warning',
                              },
                            );
                            return;
                          }

                          const toUpload = files.slice(0, remaining);
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
                    <Box sx={{ mt: 2 }}>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        {additionalImages.map((img) => (
                          <Box
                            key={img.publicId}
                            sx={{
                              width: 110,
                              height: 80,
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt="Additional"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                cursor: 'pointer',
                              }}
                              onClick={() => setMainFromImage(img)}
                            />
                          </Box>
                        ))}
                      </Stack>

                      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                        {additionalImages.map((img) => (
                          <Button
                            key={`rm-${img.publicId}`}
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
                        ))}
                      </Stack>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: 'block' }}
                      >
                        Click an additional thumbnail to make it the main image.
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      No additional images yet.
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Box sx={{ mt: 2, border: '1px dashed', borderColor: 'divider', p: 2 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <VideocamOutlinedIcon color="action" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>Additional videos</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Up to {remainingVideos} more videos (max {MAX_VIDEOS}). Total media max:{' '}
                      {MAX_TOTAL_MEDIA}.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={uploadingVideos || uploadingMain || remainingVideos <= 0}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {uploadingVideos ? 'Uploading…' : `Upload videos (up to ${remainingVideos})`}
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      hidden
                      onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                        const files = Array.from(e.target.files ?? []);
                        if (!files.length) return;

                        const remaining = remainingVideos;
                        if (remaining <= 0) {
                          enqueueSnackbar(
                            `You can only attach up to ${MAX_VIDEOS} videos (and up to ${MAX_IMAGES} images).`,
                            {
                              variant: 'warning',
                            },
                          );
                          return;
                        }

                        const toUpload = files.slice(0, remaining);
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
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      {additionalVideos.map((vid) => (
                        <Box
                          key={vid.publicId}
                          sx={{
                            width: 110,
                            height: 80,
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                            backgroundColor: 'background.paper',
                          }}
                        >
                          <video
                            src={vid.url}
                            muted
                            preload="metadata"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                      ))}
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                      {additionalVideos.map((vid) => (
                        <Button
                          key={`rmv-${vid.publicId}`}
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
                      ))}
                    </Stack>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    No additional videos yet.
                  </Typography>
                )}
              </Box>
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
        title="Delete cat"
        description="This permanently removes the listing."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </>
  );
}
