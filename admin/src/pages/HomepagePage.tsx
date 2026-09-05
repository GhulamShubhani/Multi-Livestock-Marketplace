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
import { contentApi, type HomepageSection } from '@/lib/api/system';
import { getApiErrorMessage } from '@/lib/api/client';
import { hasPermission } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { PageHeader, PrimaryAction } from '@/components/common/PageHeader';
import { DataTableShell } from '@/components/common/DataTableShell';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

const SECTION_TYPES = ['hero', 'categories', 'carousel', 'promo', 'info', 'banner', 'cta'];

const emptyForm = {
  key: '',
  type: 'hero',
  title: '',
  subtitle: '',
  description: '',
  ctaText: '',
  ctaUrl: '',
  displayOrder: 0,
  isActive: true,
};

export function HomepagePage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const perms = useAuthStore((s) => s.user?.permissions);
  const canCreate = hasPermission(perms, 'homepage:create');
  const canUpdate = hasPermission(perms, 'homepage:update');
  const canDelete = hasPermission(perms, 'homepage:delete');

  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HomepageSection | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['admin-homepage', page],
    queryFn: () => contentApi.listHomepage({ page, limit: 50 }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        key: form.key,
        type: form.type,
        title: form.title || undefined,
        subtitle: form.subtitle || undefined,
        description: form.description || undefined,
        ctaText: form.ctaText || undefined,
        ctaUrl: form.ctaUrl || undefined,
        displayOrder: Number(form.displayOrder),
        isActive: form.isActive,
      };
      if (editing) return contentApi.updateHomepage(editing._id, body);
      return contentApi.createHomepage(body);
    },
    onSuccess: async () => {
      enqueueSnackbar(editing ? 'Section updated' : 'Section created', { variant: 'success' });
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ['admin-homepage'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentApi.deleteHomepage(id),
    onSuccess: async () => {
      enqueueSnackbar('Section deleted', { variant: 'success' });
      setDeleteId(null);
      await qc.invalidateQueries({ queryKey: ['admin-homepage'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const rows = [...(query.data?.data.sections ?? [])].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );

  const columns = useMemo(
    () => [
      { key: 'order', label: 'Order' },
      { key: 'key', label: 'Key' },
      { key: 'type', label: 'Type' },
      { key: 'title', label: 'Title' },
      { key: 'active', label: 'Active' },
      { key: 'actions', label: '', align: 'right' as const },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Homepage"
        description="Manage homepage sections, titles, CTAs, and display order."
        action={
          canCreate ? (
            <PrimaryAction
              label="Add section"
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
                setOpen(true);
              }}
            />
          ) : null
        }
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
            <TableCell>{row.displayOrder}</TableCell>
            <TableCell>{row.key}</TableCell>
            <TableCell>
              <Chip size="small" label={row.type} variant="outlined" />
            </TableCell>
            <TableCell>{row.title || '—'}</TableCell>
            <TableCell>{row.isActive ? 'Yes' : 'No'}</TableCell>
            <TableCell align="right">
              {canUpdate ? (
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditing(row);
                    setForm({
                      key: row.key,
                      type: row.type,
                      title: row.title ?? '',
                      subtitle: row.subtitle ?? '',
                      description: row.description ?? '',
                      ctaText: row.ctaText ?? '',
                      ctaUrl: row.ctaUrl ?? '',
                      displayOrder: row.displayOrder ?? 0,
                      isActive: row.isActive,
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
        <DialogTitle>{editing ? 'Edit section' : 'Add section'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Key"
              required
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
            />
            <TextField
              select
              label="Type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              {SECTION_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <TextField
              label="Subtitle"
              value={form.subtitle}
              onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
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
                label="CTA text"
                value={form.ctaText}
                onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))}
              />
              <TextField
                fullWidth
                label="CTA URL"
                value={form.ctaUrl}
                onChange={(e) => setForm((f) => ({ ...f, ctaUrl: e.target.value }))}
              />
            </Stack>
            <TextField
              type="number"
              label="Display order"
              value={form.displayOrder}
              onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))}
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
        title="Delete section"
        description="This permanently removes the homepage section."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </>
  );
}
