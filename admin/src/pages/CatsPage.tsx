import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TableCell,
  TableRow,
  TextField,
  Chip,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useSnackbar } from 'notistack';
import { catalogApi, type CatAdmin } from '@/lib/api/catalog';
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

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CatAdmin | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
              {cat.featured ? <Chip size="small" label="Featured" sx={{ ml: 1 }} color="secondary" /> : null}
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
            <TextField label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
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
