import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Stack, TableCell, TableRow, TextField, Chip } from '@mui/material';
import { systemApi } from '@/lib/api/system';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTableShell } from '@/components/common/DataTableShell';

export function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const [module, setModule] = useState('');
  const [q, setQ] = useState('');

  const query = useQuery({
    queryKey: ['admin-activity', page, module, q],
    queryFn: () =>
      systemApi.listActivity({
        page,
        limit: 20,
        module: module || undefined,
        q: q || undefined,
      }),
  });

  const rows = query.data?.data.logs ?? [];
  const columns = useMemo(
    () => [
      { key: 'when', label: 'When' },
      { key: 'actor', label: 'Actor' },
      { key: 'action', label: 'Action' },
      { key: 'module', label: 'Module' },
      { key: 'severity', label: 'Severity' },
    ],
    [],
  );

  return (
    <>
      <PageHeader title="Activity logs" description="Audit trail of admin and system actions." />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Search"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
        <TextField
          size="small"
          label="Module"
          value={module}
          onChange={(e) => {
            setPage(1);
            setModule(e.target.value);
          }}
          placeholder="e.g. users"
        />
      </Stack>
      <DataTableShell
        columns={columns}
        loading={query.isLoading}
        error={query.isError ? getApiErrorMessage(query.error) : null}
        page={query.data?.meta?.page}
        totalPages={query.data?.meta?.totalPages}
        onPageChange={setPage}
      >
        {rows.map((log) => (
          <TableRow key={log._id} hover>
            <TableCell>{formatDate(log.createdAt)}</TableCell>
            <TableCell>{log.actorEmail || '—'}</TableCell>
            <TableCell>{log.action}</TableCell>
            <TableCell>{log.module}</TableCell>
            <TableCell>
              <Chip
                size="small"
                label={log.severity}
                color={log.severity === 'critical' ? 'error' : log.severity === 'warn' ? 'warning' : 'default'}
              />
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </>
  );
}
