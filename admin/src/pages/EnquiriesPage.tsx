import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Chip, MenuItem, Stack, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { commerceApi } from '@/lib/api/commerce';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatDate, hasPermission, namedRef } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTableShell } from '@/components/common/DataTableShell';

const STATUSES = ['new', 'contacted', 'interested', 'negotiating', 'sold', 'closed'];

function statusColor(
  status: string,
): 'default' | 'info' | 'warning' | 'success' | 'error' | 'secondary' {
  if (status === 'new') return 'info';
  if (status === 'contacted' || status === 'interested') return 'warning';
  if (status === 'negotiating') return 'secondary';
  if (status === 'sold') return 'success';
  if (status === 'closed') return 'default';
  return 'default';
}

export function EnquiriesPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const canUpdate = hasPermission(
    useAuthStore((s) => s.user?.permissions),
    'enquiries:update',
  );
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const query = useQuery({
    queryKey: ['admin-enquiries', page, status],
    queryFn: () => commerceApi.listEnquiries({ page, limit: 20, status: status || undefined }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) =>
      commerceApi.setEnquiryStatus(id, next),
    onSuccess: async () => {
      enqueueSnackbar('Enquiry status updated', { variant: 'success' });
      await qc.invalidateQueries({ queryKey: ['admin-enquiries'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const rows = query.data?.data.enquiries ?? [];
  const columns = useMemo(
    () => [
      { key: 'buyer', label: 'Buyer' },
      { key: 'listing', label: 'Listing' },
      { key: 'message', label: 'Message' },
      { key: 'method', label: 'Method' },
      { key: 'status', label: 'Status' },
      { key: 'date', label: 'Date' },
    ],
    [],
  );

  return (
    <>
      <PageHeader title="Enquiries" description="Buyer interest and contact requests." />
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
        {rows.map((row) => {
          const listingLabel =
            typeof row.listingId === 'object' && row.listingId
              ? row.listingId.title || row.listingId._id
              : namedRef(row.listingId);
          return (
            <TableRow key={row._id} hover>
              <TableCell>
                <Typography variant="body2">{row.buyerName || '—'}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {[row.buyerPhone, row.buyerEmail].filter(Boolean).join(' · ') || '—'}
                </Typography>
              </TableCell>
              <TableCell>{listingLabel}</TableCell>
              <TableCell sx={{ maxWidth: 280 }}>
                <Typography variant="body2" noWrap title={row.message}>
                  {row.message}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip size="small" label={row.contactMethod} variant="outlined" />
              </TableCell>
              <TableCell>
                {canUpdate ? (
                  <TextField
                    select
                    size="small"
                    value={row.status}
                    onChange={(e) => statusMutation.mutate({ id: row._id, next: e.target.value })}
                    sx={{ minWidth: 130 }}
                  >
                    {STATUSES.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <Chip size="small" label={row.status} color={statusColor(row.status)} />
                )}
              </TableCell>
              <TableCell>{formatDate(row.createdAt)}</TableCell>
            </TableRow>
          );
        })}
      </DataTableShell>
    </>
  );
}
