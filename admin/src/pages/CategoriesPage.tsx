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
  Stack,
  Switch,
  TableCell,
  TableRow,
  TextField,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useSnackbar } from 'notistack';
import { catalogApi, type CategoryAdmin } from '@/lib/api/catalog';
import { getApiErrorMessage } from '@/lib/api/client';
import { hasPermission } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { PageHeader, PrimaryAction } from '@/components/common/PageHeader';
import { DataTableShell } from '@/components/common/DataTableShell';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export function CategoriesPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const perms = useAuthStore((s) => s.user?.permissions);
  const canCreate = hasPermission(perms, 'categories:create');
  const canUpdate = hasPermission(perms, 'categories:update');
  const canDelete = hasPermission(perms, 'categories:delete');

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryAdmin | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: '',
    group: '',
    isActive: true,
    sortOrder: 0,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['admin-categories', page, q],
    queryFn: () => catalogApi.listCategories({ page, limit: 20, q: q || undefined }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        name: form.name,
        description: form.description || undefined,
        icon: form.icon || undefined,
        group: form.group || undefined,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder),
      };
      if (editing) return catalogApi.updateCategory(editing._id, body);
      return catalogApi.createCategory(body);
    },
    onSuccess: async () => {
      enqueueSnackbar(editing ? 'Category updated' : 'Category created', { variant: 'success' });
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogApi.deleteCategory(id),
    onSuccess: async () => {
      enqueueSnackbar('Category deleted', { variant: 'success' });
      setDeleteId(null);
      await qc.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const rows = query.data?.data.categories ?? [];
  const columns = useMemo(
    () => [
      { key: 'name', label: 'Name' },
      { key: 'group', label: 'Group' },
      { key: 'slug', label: 'Slug' },
      { key: 'active', label: 'Active' },
      { key: 'actions', label: '', align: 'right' as const },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Categories"
        description="Organize livestock listings by animal type."
        action={
          canCreate ? (
            <PrimaryAction
              label="Add category"
              onClick={() => {
                setEditing(null);
                setForm({
                  name: '',
                  description: '',
                  icon: '',
                  group: '',
                  isActive: true,
                  sortOrder: 0,
                });
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
        {rows.map((row) => (
          <TableRow key={row._id} hover>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.group || '—'}</TableCell>
            <TableCell>{row.slug}</TableCell>
            <TableCell>{row.isActive ? 'Yes' : 'No'}</TableCell>
            <TableCell align="right">
              {canUpdate ? (
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditing(row);
                    setForm({
                      name: row.name,
                      description: row.description ?? '',
                      icon: row.icon ?? '',
                      group: row.group ?? '',
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
        ))}
      </DataTableShell>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit category' : 'Add category'}</DialogTitle>
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
              minRows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Group"
                helperText="e.g. cattle, poultry"
                value={form.group}
                onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Icon"
                helperText="Icon key or emoji"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              />
            </Stack>
            <TextField
              type="number"
              label="Sort order"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
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
        title="Delete category"
        description="This permanently deletes the category."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </>
  );
}
