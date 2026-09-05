import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TableCell,
  TableRow,
  TextField,
  Chip,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { commerceApi } from '@/lib/api/commerce';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatDate, formatMoney, hasPermission, namedRef } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTableShell } from '@/components/common/DataTableShell';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

const STATUSES = ['pending', 'submitted', 'under_verification', 'verified', 'rejected', 'refunded'];

function paymentChipColor(status: string): 'default' | 'warning' | 'success' | 'error' | 'info' {
  if (status === 'verified') return 'success';
  if (status === 'submitted' || status === 'under_verification') return 'warning';
  if (status === 'rejected') return 'error';
  if (status === 'refunded') return 'info';
  return 'default';
}

export function PaymentsPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const perms = useAuthStore((s) => s.user?.permissions);
  const canVerify = hasPermission(perms, 'payments:verify');
  const canRefund = hasPermission(perms, 'payments:refund');

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [refundId, setRefundId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const query = useQuery({
    queryKey: ['admin-payments', page, status],
    queryFn: () => commerceApi.listPayments({ page, limit: 20, status: status || undefined }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({
      id,
      next,
      rejectedReason,
    }: {
      id: string;
      next: 'verified' | 'rejected';
      rejectedReason?: string;
    }) =>
      commerceApi.verifyPayment(id, {
        status: next,
        rejectedReason: rejectedReason || undefined,
      }),
    onSuccess: async (_, vars) => {
      enqueueSnackbar(vars.next === 'verified' ? 'Payment verified' : 'Payment rejected', {
        variant: 'success',
      });
      setRejectId(null);
      setRejectReason('');
      await qc.invalidateQueries({ queryKey: ['admin-payments'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const refundMutation = useMutation({
    mutationFn: (id: string) => commerceApi.refund(id),
    onSuccess: async () => {
      enqueueSnackbar('Payment marked refunded', { variant: 'success' });
      setRefundId(null);
      await qc.invalidateQueries({ queryKey: ['admin-payments'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const rows = query.data?.data.payments ?? [];
  const columns = useMemo(
    () => [
      { key: 'ref', label: 'Reference' },
      { key: 'amount', label: 'Amount', align: 'right' as const },
      { key: 'provider', label: 'Method' },
      { key: 'status', label: 'Status' },
      { key: 'date', label: 'Date' },
      { key: 'actions', label: '', align: 'right' as const },
    ],
    [],
  );

  return (
    <>
      <PageHeader title="Payments" description="Manual payment verification and refunds." />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          sx={{ minWidth: 180 }}
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
        page={query.data?.meta?.page}
        totalPages={query.data?.meta?.totalPages}
        onPageChange={setPage}
      >
        {rows.map((p) => {
          const orderLabel =
            typeof p.order === 'object' && p.order
              ? p.order.orderNumber || p.order._id
              : namedRef(p.order);
          const listingLabel =
            typeof p.listing === 'object' && p.listing
              ? p.listing.title || p.listing._id
              : namedRef(p.listing);
          const ref = orderLabel !== '—' ? orderLabel : listingLabel;
          const canActOn = p.status === 'submitted' || p.status === 'under_verification';

          return (
            <TableRow key={p._id} hover>
              <TableCell>{ref}</TableCell>
              <TableCell align="right">{formatMoney(p.amount, p.currency)}</TableCell>
              <TableCell>{p.provider || p.method || '—'}</TableCell>
              <TableCell>
                <Chip size="small" label={p.status} color={paymentChipColor(p.status)} />
              </TableCell>
              <TableCell>{formatDate(p.createdAt)}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                  {canVerify && canActOn ? (
                    <>
                      <Button
                        size="small"
                        color="success"
                        onClick={() => verifyMutation.mutate({ id: p._id, next: 'verified' })}
                        disabled={verifyMutation.isPending}
                      >
                        Verify
                      </Button>
                      <Button size="small" color="error" onClick={() => setRejectId(p._id)}>
                        Reject
                      </Button>
                    </>
                  ) : null}
                  {canRefund && p.status === 'verified' ? (
                    <Button size="small" onClick={() => setRefundId(p._id)}>
                      Refund
                    </Button>
                  ) : null}
                </Stack>
              </TableCell>
            </TableRow>
          );
        })}
      </DataTableShell>

      <Dialog open={Boolean(rejectId)} onClose={() => setRejectId(null)} fullWidth maxWidth="xs">
        <DialogTitle>Reject payment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            sx={{ mt: 1 }}
            label="Rejected reason"
            multiline
            minRows={2}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={verifyMutation.isPending}
            onClick={() =>
              rejectId &&
              verifyMutation.mutate({
                id: rejectId,
                next: 'rejected',
                rejectedReason: rejectReason,
              })
            }
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(refundId)}
        title="Refund payment"
        description="Mark this verified payment as refunded."
        confirmLabel="Refund"
        loading={refundMutation.isPending}
        onClose={() => setRefundId(null)}
        onConfirm={() => refundId && refundMutation.mutate(refundId)}
      />
    </>
  );
}
