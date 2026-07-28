import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TableCell,
  TableRow,
  TextField,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useSnackbar } from 'notistack';
import { contentApi, type CmsPage } from '@/lib/api/system';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatDate, hasPermission } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { PageHeader, PrimaryAction } from '@/components/common/PageHeader';
import { DataTableShell } from '@/components/common/DataTableShell';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export function CmsPageView() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const perms = useAuthStore((s) => s.user?.permissions);
  const canCreate = hasPermission(perms, 'cms:create');
  const canUpdate = hasPermission(perms, 'cms:update');
  const canDelete = hasPermission(perms, 'cms:delete');

  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [form, setForm] = useState({ title: '', content: '', status: 'draft' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['admin-cms', page],
    queryFn: () => contentApi.listCms({ page, limit: 20 }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) return contentApi.updateCms(editing._id, form);
      return contentApi.createCms(form);
    },
    onSuccess: async () => {
      enqueueSnackbar(editing ? 'Page updated' : 'Page created', { variant: 'success' });
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ['admin-cms'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentApi.deleteCms(id),
    onSuccess: async () => {
      enqueueSnackbar('Page deleted', { variant: 'success' });
      setDeleteId(null);
      await qc.invalidateQueries({ queryKey: ['admin-cms'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const rows = query.data?.data.pages ?? [];
  const columns = useMemo(
    () => [
      { key: 'title', label: 'Title' },
      { key: 'slug', label: 'Slug' },
      { key: 'status', label: 'Status' },
      { key: 'updated', label: 'Updated' },
      { key: 'actions', label: '', align: 'right' as const },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="CMS"
        description="Static content pages for the storefront."
        action={
          canCreate ? (
            <PrimaryAction
              label="Add page"
              onClick={() => {
                setEditing(null);
                setForm({ title: '', content: '', status: 'draft' });
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
            <TableCell>{row.slug}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell>{formatDate(row.updatedAt)}</TableCell>
            <TableCell align="right">
              {canUpdate ? (
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditing(row);
                    setForm({ title: row.title, content: row.content, status: row.status });
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

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? 'Edit page' : 'Add page'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <TextField
              label="Content"
              multiline
              minRows={8}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <MenuItem value="draft">draft</MenuItem>
              <MenuItem value="published">published</MenuItem>
            </TextField>
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
        title="Delete page"
        description="This permanently deletes the CMS page."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </>
  );
}
