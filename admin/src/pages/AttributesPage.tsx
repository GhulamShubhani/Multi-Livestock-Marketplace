import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  ListItemText,
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
import { catalogApi, type AttributeAdmin, type AttributeType } from '@/lib/api/catalog';
import { getApiErrorMessage } from '@/lib/api/client';
import { hasPermission, idOf } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { PageHeader, PrimaryAction } from '@/components/common/PageHeader';
import { DataTableShell } from '@/components/common/DataTableShell';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

const ATTRIBUTE_TYPES: AttributeType[] = [
  'text',
  'number',
  'decimal',
  'boolean',
  'date',
  'select',
  'multiselect',
  'radio',
  'textarea',
  'yes_no',
  'image',
];

const emptyForm = {
  name: '',
  key: '',
  label: '',
  type: 'text' as AttributeType,
  unit: '',
  optionsText: '',
  required: false,
  categoryIds: [] as string[],
  filterable: true,
  showOnCard: false,
  isActive: true,
  sortOrder: 0,
};

export function AttributesPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const perms = useAuthStore((s) => s.user?.permissions);
  const canCreate = hasPermission(perms, 'attributes:create');
  const canUpdate = hasPermission(perms, 'attributes:update');
  const canDelete = hasPermission(perms, 'attributes:delete');

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AttributeAdmin | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['admin-attributes', page, q],
    queryFn: () => catalogApi.listAttributes({ page, limit: 20, q: q || undefined }),
  });

  const categories = useQuery({
    queryKey: ['admin-categories-options'],
    queryFn: () => catalogApi.listCategories({ limit: 100 }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const needsOptions = ['select', 'multiselect', 'radio'].includes(form.type);
      const options = form.optionsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const body: Record<string, unknown> = {
        name: form.name,
        key: form.key,
        label: form.label || form.name,
        type: form.type,
        unit: form.unit || undefined,
        options: needsOptions ? options : undefined,
        required: form.required,
        categoryIds: form.categoryIds,
        filterable: form.filterable,
        showOnCard: form.showOnCard,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder),
      };
      if (editing) return catalogApi.updateAttribute(editing._id, body);
      return catalogApi.createAttribute(body);
    },
    onSuccess: async () => {
      enqueueSnackbar(editing ? 'Attribute updated' : 'Attribute created', { variant: 'success' });
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ['admin-attributes'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogApi.deleteAttribute(id),
    onSuccess: async () => {
      enqueueSnackbar('Attribute deleted', { variant: 'success' });
      setDeleteId(null);
      await qc.invalidateQueries({ queryKey: ['admin-attributes'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const rows = query.data?.data.attributes ?? [];
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories.data?.data.categories ?? []) map.set(c._id, c.name);
    return map;
  }, [categories.data]);

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Name' },
      { key: 'key', label: 'Key' },
      { key: 'type', label: 'Type' },
      { key: 'categories', label: 'Categories' },
      { key: 'flags', label: 'Flags' },
      { key: 'actions', label: '', align: 'right' as const },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Attributes"
        description="Define dynamic fields for livestock categories."
        action={
          canCreate ? (
            <PrimaryAction
              label="Add attribute"
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
                setOpen(true);
              }}
            />
          ) : null
        }
      />

      <TextField
        size="small"
        label="Search"
        value={q}
        onChange={(e) => {
          setPage(1);
          setQ(e.target.value);
        }}
        sx={{ mb: 2 }}
      />

      <DataTableShell
        columns={columns}
        loading={query.isLoading}
        error={query.isError ? getApiErrorMessage(query.error) : null}
        page={query.data?.meta?.page}
        totalPages={query.data?.meta?.totalPages}
        onPageChange={setPage}
      >
        {rows.map((row) => {
          const catLabels = (row.categoryIds ?? [])
            .map((c) => (typeof c === 'string' ? (categoryMap.get(c) ?? c) : (c.name ?? idOf(c))))
            .filter(Boolean);
          return (
            <TableRow key={row._id} hover>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.key}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell>{catLabels.join(', ') || '—'}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                  {row.required ? <Chip size="small" label="required" /> : null}
                  {row.filterable ? <Chip size="small" label="filterable" /> : null}
                  {row.showOnCard ? <Chip size="small" label="card" /> : null}
                  {!row.isActive ? <Chip size="small" label="inactive" color="warning" /> : null}
                </Stack>
              </TableCell>
              <TableCell align="right">
                {canUpdate ? (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditing(row);
                      setForm({
                        name: row.name,
                        key: row.key,
                        label: row.label,
                        type: row.type,
                        unit: row.unit ?? '',
                        optionsText: (row.options ?? []).join('\n'),
                        required: row.required,
                        categoryIds: (row.categoryIds ?? []).map((c) => idOf(c)),
                        filterable: row.filterable,
                        showOnCard: row.showOnCard,
                        isActive: row.isActive,
                        sortOrder: row.sortOrder ?? 0,
                      });
                      setOpen(true);
                    }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                ) : null}
                {canDelete ? (
                  <IconButton size="small" onClick={() => setDeleteId(row._id)}>
                    <DeleteOutlinedIcon fontSize="small" />
                  </IconButton>
                ) : null}
              </TableCell>
            </TableRow>
          );
        })}
      </DataTableShell>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit attribute' : 'Add attribute'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <TextField
              label="Key"
              required
              helperText="Stable machine key, e.g. milk_yield"
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
            />
            <TextField
              label="Label"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                select
                label="Type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AttributeType }))}
              >
                {ATTRIBUTE_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Unit"
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              />
            </Stack>
            {['select', 'multiselect', 'radio'].includes(form.type) ? (
              <TextField
                label="Options (one per line)"
                multiline
                minRows={3}
                value={form.optionsText}
                onChange={(e) => setForm((f) => ({ ...f, optionsText: e.target.value }))}
              />
            ) : null}
            <TextField
              select
              label="Categories"
              slotProps={{
                select: {
                  multiple: true,
                  renderValue: (selected: unknown) =>
                    (selected as string[]).map((id) => categoryMap.get(id) ?? id).join(', '),
                },
              }}
              value={form.categoryIds}
              onChange={(e) => {
                const next = e.target.value;
                setForm((f) => ({
                  ...f,
                  categoryIds: typeof next === 'string' ? next.split(',') : next,
                }));
              }}
            >
              {(categories.data?.data.categories ?? []).map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  <Checkbox checked={form.categoryIds.includes(c._id)} size="small" />
                  <ListItemText primary={c.name} />
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="number"
              label="Sort order"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
            />
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.required}
                    onChange={(e) => setForm((f) => ({ ...f, required: e.target.checked }))}
                  />
                }
                label="Required"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.filterable}
                    onChange={(e) => setForm((f) => ({ ...f, filterable: e.target.checked }))}
                  />
                }
                label="Filterable"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.showOnCard}
                    onChange={(e) => setForm((f) => ({ ...f, showOnCard: e.target.checked }))}
                  />
                }
                label="Show on card"
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete attribute"
        description="This permanently deletes the attribute definition."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </>
  );
}
