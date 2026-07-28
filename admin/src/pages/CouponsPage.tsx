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
import { commerceApi, type CouponAdmin } from '@/lib/api/commerce';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatMoney, hasPermission } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { PageHeader, PrimaryAction } from '@/components/common/PageHeader';
import { DataTableShell } from '@/components/common/DataTableShell';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export function CouponsPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const perms = useAuthStore((s) => s.user?.permissions);
  const canCreate = hasPermission(perms, 'coupons:create');
  const canUpdate = hasPermission(perms, 'coupons:update');
  const canDelete = hasPermission(perms, 'coupons:delete');

  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CouponAdmin | null>(null);
  const [form, setForm] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: 10,
    isActive: true,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['admin-coupons', page],
    queryFn: () => commerceApi.listCoupons({ page, limit: 20 }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        code: form.code.toUpperCase(),
        type: form.type,
        value: Number(form.value),
        isActive: form.isActive,
      };
      if (editing) return commerceApi.updateCoupon(editing._id, body);
      return commerceApi.createCoupon(body);
    },
    onSuccess: async () => {
      enqueueSnackbar(editing ? 'Coupon updated' : 'Coupon created', { variant: 'success' });
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => commerceApi.deleteCoupon(id),
    onSuccess: async () => {
      enqueueSnackbar('Coupon deleted', { variant: 'success' });
      setDeleteId(null);
      await qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const rows = query.data?.data.coupons ?? [];
  const columns = useMemo(
    () => [
      { key: 'code', label: 'Code' },
      { key: 'type', label: 'Type' },
      { key: 'value', label: 'Value' },
      { key: 'active', label: 'Active' },
      { key: 'actions', label: '', align: 'right' as const },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Coupons"
        description="Discount codes for checkout."
        action={
          canCreate ? (
            <PrimaryAction
              label="Add coupon"
              onClick={() => {
                setEditing(null);
                setForm({ code: '', type: 'percent', value: 10, isActive: true });
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
            <TableCell>{row.code}</TableCell>
            <TableCell>{row.type}</TableCell>
            <TableCell>{row.type === 'percent' ? `${row.value}%` : formatMoney(row.value)}</TableCell>
            <TableCell>{row.isActive ? 'Yes' : 'No'}</TableCell>
            <TableCell align="right">
              {canUpdate ? (
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditing(row);
                    setForm({
                      code: row.code,
                      type: row.type,
                      value: row.value,
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
        <DialogTitle>{editing ? 'Edit coupon' : 'Add coupon'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            <TextField
              select
              label="Type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'percent' | 'fixed' }))}
            >
              <MenuItem value="percent">Percent</MenuItem>
              <MenuItem value="fixed">Fixed (cents)</MenuItem>
            </TextField>
            <TextField
              type="number"
              label="Value"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
            />
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
        title="Delete coupon"
        description="This permanently deletes the coupon."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </>
  );
}
