import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, MenuItem, Stack, TableCell, TableRow, TextField, Rating } from '@mui/material';
import { useSnackbar } from 'notistack';
import { commerceApi } from '@/lib/api/commerce';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatDate, hasPermission, namedRef } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTableShell } from '@/components/common/DataTableShell';

const STATUSES = ['pending', 'approved', 'rejected'];

export function ReviewsPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const perms = useAuthStore((s) => s.user?.permissions);
  const canModerate = hasPermission(perms, 'reviews:moderate');
  const canDelete = hasPermission(perms, 'reviews:delete') || hasPermission(perms, 'reviews:moderate');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('pending');

  const query = useQuery({
    queryKey: ['admin-reviews', page, status],
    queryFn: () => commerceApi.listReviews({ page, limit: 20, status: status || undefined }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) => commerceApi.setReviewStatus(id, next),
    onSuccess: async () => {
      enqueueSnackbar('Review updated', { variant: 'success' });
      await qc.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => commerceApi.deleteReview(id),
    onSuccess: async () => {
      enqueueSnackbar('Review deleted', { variant: 'success' });
      await qc.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const rows = query.data?.data.reviews ?? [];
  const columns = useMemo(
    () => [
      { key: 'review', label: 'Review' },
      { key: 'rating', label: 'Rating' },
      { key: 'status', label: 'Status' },
      { key: 'actions', label: '', align: 'right' as const },
    ],
    [],
  );

  return (
    <>
      <PageHeader title="Reviews" description="Moderate customer reviews before they go public." />
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
        {rows.map((r) => (
          <TableRow key={r._id} hover>
            <TableCell>
              <strong>{r.title || 'Untitled'}</strong>
              <br />
              <span style={{ fontSize: 12, opacity: 0.75 }}>
                {r.user ? `${r.user.firstName} ${r.user.lastName}` : 'User'} · {namedRef(r.cat as { name?: string })} ·{' '}
                {formatDate(r.createdAt)}
              </span>
              <br />
              {r.body}
            </TableCell>
            <TableCell>
              <Rating value={r.rating} readOnly size="small" />
            </TableCell>
            <TableCell>
              {canModerate ? (
                <TextField
                  select
                  size="small"
                  value={r.status}
                  onChange={(e) => statusMutation.mutate({ id: r._id, next: e.target.value })}
                  sx={{ minWidth: 120 }}
                >
                  {STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                r.status
              )}
            </TableCell>
            <TableCell align="right">
              {canDelete ? (
                <Button size="small" color="error" onClick={() => deleteMutation.mutate(r._id)}>
                  Delete
                </Button>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </>
  );
}
