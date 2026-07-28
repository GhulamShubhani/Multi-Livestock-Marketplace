import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, MenuItem, Stack, TableCell, TableRow, TextField, Chip } from '@mui/material';
import { useSnackbar } from 'notistack';
import { commerceApi } from '@/lib/api/commerce';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatDate, formatMoney, hasPermission } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTableShell } from '@/components/common/DataTableShell';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export function OrdersPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const canUpdate = hasPermission(useAuthStore((s) => s.user?.permissions), 'orders:update');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const query = useQuery({
    queryKey: ['admin-orders', page, status],
    queryFn: () => commerceApi.listOrders({ page, limit: 20, status: status || undefined }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) => commerceApi.setOrderStatus(id, next),
    onSuccess: async () => {
      enqueueSnackbar('Order status updated', { variant: 'success' });
      await qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => commerceApi.cancelOrder(id),
    onSuccess: async () => {
      enqueueSnackbar('Order cancelled', { variant: 'success' });
      await qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const rows = query.data?.data.orders ?? [];
  const columns = useMemo(
    () => [
      { key: 'order', label: 'Order' },
      { key: 'customer', label: 'Customer' },
      { key: 'total', label: 'Total', align: 'right' as const },
      { key: 'payment', label: 'Payment' },
      { key: 'status', label: 'Status' },
      { key: 'actions', label: '', align: 'right' as const },
    ],
    [],
  );

  return (
    <>
      <PageHeader title="Orders" description="Fulfillment and order status management." />
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          sx={{ minWidth: 160 }}
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
        {rows.map((order) => {
          const customer =
            typeof order.user === 'object' && order.user
              ? order.user.email || `${order.user.firstName ?? ''} ${order.user.lastName ?? ''}`.trim()
              : '—';
          return (
            <TableRow key={order._id} hover>
              <TableCell>
                {order.orderNumber}
                <br />
                <span style={{ fontSize: 12, opacity: 0.7 }}>{formatDate(order.createdAt)}</span>
              </TableCell>
              <TableCell>{customer}</TableCell>
              <TableCell align="right">{formatMoney(order.total, order.currency)}</TableCell>
              <TableCell>
                <Chip size="small" label={order.paymentStatus} />
              </TableCell>
              <TableCell>
                {canUpdate ? (
                  <TextField
                    select
                    size="small"
                    value={order.status}
                    onChange={(e) => statusMutation.mutate({ id: order._id, next: e.target.value })}
                    sx={{ minWidth: 130 }}
                  >
                    {STATUSES.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  order.status
                )}
              </TableCell>
              <TableCell align="right">
                {canUpdate && !['cancelled', 'refunded', 'delivered'].includes(order.status) ? (
                  <Button size="small" color="error" onClick={() => cancelMutation.mutate(order._id)}>
                    Cancel
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          );
        })}
      </DataTableShell>
    </>
  );
}
