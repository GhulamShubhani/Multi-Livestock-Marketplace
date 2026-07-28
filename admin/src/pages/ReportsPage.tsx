import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { dashboardApi } from '@/lib/api/dashboard';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatMoney, namedRef } from '@/lib/utils';
import { PageHeader } from '@/components/common/PageHeader';

export function ReportsPage() {
  const [days, setDays] = useState(30);
  const sales = useQuery({
    queryKey: ['dashboard', 'sales', days],
    queryFn: () => dashboardApi.sales(days),
  });
  const inventory = useQuery({
    queryKey: ['dashboard', 'inventory'],
    queryFn: () => dashboardApi.inventory(),
  });

  return (
    <Box>
      <PageHeader title="Reports" description="Sales and inventory snapshots for operations." />
      {(sales.isError || inventory.isError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getApiErrorMessage(sales.error || inventory.error)}
        </Alert>
      )}

      <TextField
        select
        size="small"
        label="Sales window"
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
        sx={{ mb: 3, minWidth: 160 }}
      >
        {[7, 14, 30, 60, 90].map((d) => (
          <MenuItem key={d} value={d}>
            Last {d} days
          </MenuItem>
        ))}
      </TextField>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Revenue by day
            </Typography>
            <Stack spacing={1}>
              {(sales.data?.data.byDay ?? []).map((d) => (
                <Stack key={d.date} direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2">{d.date}</Typography>
                  <Typography variant="body2">
                    {d.orders} · {formatMoney(d.revenueCents)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Orders by status
            </Typography>
            <Stack spacing={1}>
              {(sales.data?.data.byStatus ?? []).map((s) => (
                <Stack key={s.status} direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2">{s.status}</Typography>
                  <Typography variant="body2">{s.count}</Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
          <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Inventory by status
            </Typography>
            <Stack spacing={1}>
              {(inventory.data?.data.byStatus ?? []).map((s) => (
                <Stack key={s.status} direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2">{s.status}</Typography>
                  <Typography variant="body2">{s.count}</Typography>
                </Stack>
              ))}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Low stock items: {(inventory.data?.data.lowStock ?? []).length}
              {Array.isArray(inventory.data?.data.lowStock) && inventory.data.data.lowStock.length
                ? ` (${inventory.data.data.lowStock
                    .slice(0, 3)
                    .map((c) => namedRef(c as { name?: string }))
                    .join(', ')})`
                : ''}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
