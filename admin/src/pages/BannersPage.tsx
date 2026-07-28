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
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useSnackbar } from 'notistack';
import { contentApi, type BannerAdmin } from '@/lib/api/system';
import { getApiErrorMessage } from '@/lib/api/client';
import { hasPermission } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { PageHeader, PrimaryAction } from '@/components/common/PageHeader';
import { DataTableShell } from '@/components/common/DataTableShell';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

const PLACEMENTS = ['home_hero', 'home_secondary', 'sidebar'];

export function BannersPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const perms = useAuthStore((s) => s.user?.permissions);
  const canCreate = hasPermission(perms, 'banners:create');
  const canUpdate = hasPermission(perms, 'banners:update');
  const canDelete = hasPermission(perms, 'banners:delete');

  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BannerAdmin | null>(null);
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    publicId: 'manual',
    placement: 'home_hero',
    linkUrl: '',
    sortOrder: 0,
    isActive: true,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['admin-banners', page],
    queryFn: () => contentApi.listBanners({ page, limit: 20 }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        return contentApi.updateBanner(editing._id, {
          title: form.title,
          placement: form.placement,
          isActive: form.isActive,
        });
      }
      return contentApi.createBanner({
        title: form.title,
        image: { url: form.imageUrl, publicId: form.publicId || 'manual' },
        placement: form.placement,
        linkUrl: form.linkUrl || undefined,
        sortOrder: Number(form.sortOrder),
        isActive: form.isActive,
      });
    },
    onSuccess: async () => {
      enqueueSnackbar(editing ? 'Banner updated' : 'Banner created', { variant: 'success' });
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ['admin-banners'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentApi.deleteBanner(id),
    onSuccess: async () => {
      enqueueSnackbar('Banner deleted', { variant: 'success' });
      setDeleteId(null);
      await qc.invalidateQueries({ queryKey: ['admin-banners'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const rows = query.data?.data.banners ?? [];
  const columns = useMemo(
    () => [
      { key: 'title', label: 'Title' },
      { key: 'placement', label: 'Placement' },
      { key: 'active', label: 'Active' },
      { key: 'actions', label: '', align: 'right' as const },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Banners"
        description="Homepage and sidebar promotional banners."
        action={
          canCreate ? (
            <PrimaryAction
              label="Add banner"
              onClick={() => {
                setEditing(null);
                setForm({
                  title: '',
                  imageUrl: '',
                  publicId: 'manual',
                  placement: 'home_hero',
                  linkUrl: '',
                  sortOrder: 0,
                  isActive: true,
                });
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
            <TableCell>{row.title}</TableCell>
            <TableCell>{row.placement}</TableCell>
            <TableCell>{row.isActive ? 'Yes' : 'No'}</TableCell>
            <TableCell align="right">
              {canUpdate ? (
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditing(row);
                    setForm({
                      title: row.title,
                      imageUrl: row.image?.url ?? '',
                      publicId: row.image?.publicId ?? 'manual',
                      placement: row.placement,
                      linkUrl: row.linkUrl ?? '',
                      sortOrder: row.sortOrder,
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
        <DialogTitle>{editing ? 'Edit banner' : 'Add banner'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            {!editing ? (
              <TextField
                label="Image URL"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              />
            ) : null}
            <TextField
              select
              label="Placement"
              value={form.placement}
              onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))}
            >
              {PLACEMENTS.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            {!editing ? (
              <TextField
                label="Link URL"
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
              />
            ) : null}
            <FormControlLabel
              control={
                <Switch checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
              }
              label="Active"
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
        title="Delete banner"
        description="This permanently deletes the banner."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </>
  );
}
