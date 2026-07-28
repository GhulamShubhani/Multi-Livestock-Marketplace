import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, TableCell, TableRow, Chip } from '@mui/material';
import { useSnackbar } from 'notistack';
import { commerceApi } from '@/lib/api/commerce';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatDate, formatMoney, hasPermission, namedRef } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTableShell } from '@/components/common/DataTableShell';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export function PaymentsPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const canRefund = hasPermission(useAuthStore((s) => s.user?.permissions), 'payments:refund');
  const [page, setPage] = useState(1);
  const [refundId, setRefundId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['admin-payments', page],
    queryFn: () => commerceApi.listPayments({ page, limit: 20 }),
  });

  const refundMutation = useMutation({
    mutationFn: (id: string) => commerceApi.refund(id),
    onSuccess: async () => {
      enqueueSnackbar('Refund initiated', { variant: 'success' });
      setRefundId(null);
      await qc.invalidateQueries({ queryKey: ['admin-payments'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const rows = query.data?.data.payments ?? [];
  const columns = useMemo(
    () => [
      { key: 'order', label: 'Order' },
      { key: 'amount', label: 'Amount', align: 'right' as const },
      { key: 'status', label: 'Status' },
      { key: 'date', label: 'Date' },
      { key: 'actions', label: '', align: 'right' as const },
    ],
    [],
  );

  return (
    <>
      <PageHeader title="Payments" description="Payment history and refunds." />
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
            typeof p.order === 'object' && p.order ? p.order.orderNumber || p.order._id : namedRef(p.order);
          return (
            <TableRow key={p._id} hover>
              <TableCell>{orderLabel}</TableCell>
              <TableCell align="right">{formatMoney(p.amount, p.currency)}</TableCell>
              <TableCell>
                <Chip size="small" label={p.status} />
              </TableCell>
              <TableCell>{formatDate(p.createdAt)}</TableCell>
              <TableCell align="right">
                {canRefund && p.status === 'succeeded' ? (
                  <Button size="small" onClick={() => setRefundId(p._id)}>
                    Refund
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          );
        })}
      </DataTableShell>

      <ConfirmDialog
        open={Boolean(refundId)}
        title="Refund payment"
        description="Issue a full refund for this payment (Stripe or mock depending on environment)."
        confirmLabel="Refund"
        loading={refundMutation.isPending}
        onClose={() => setRefundId(null)}
        onConfirm={() => refundId && refundMutation.mutate(refundId)}
      />
    </>
  );
}
