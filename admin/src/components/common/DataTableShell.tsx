import {
  Alert,
  Box,
  CircularProgress,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

type Column = {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
};

type Props = {
  columns: Column[];
  loading?: boolean;
  error?: string | null;
  empty?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  children: ReactNode;
};

export function DataTableShell({
  columns,
  loading,
  error,
  empty = 'No records found.',
  page,
  totalPages,
  onPageChange,
  children,
}: Props) {
  return (
    <Paper sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      {error ? (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      ) : null}
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((c) => (
                  <TableCell key={c.key} align={c.align} sx={{ width: c.width, fontWeight: 700 }}>
                    {c.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>{children}</TableBody>
          </Table>
          {!loading && !error && !children ? (
            <Typography color="text.secondary" sx={{ p: 3 }}>
              {empty}
            </Typography>
          ) : null}
          {totalPages && totalPages > 1 && onPageChange ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Pagination count={totalPages} page={page ?? 1} onChange={(_, p) => onPageChange(p)} />
            </Box>
          ) : null}
        </>
      )}
    </Paper>
  );
}
