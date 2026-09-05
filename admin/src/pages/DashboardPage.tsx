import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { dashboardApi } from '@/lib/api/dashboard';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatMoney, formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/common/PageHeader';

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700 }}>
        {value}
      </Typography>
    </Paper>
  );
}

export function DashboardPage() {
  const query = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardApi.overview(),
  });

  const data = query.data?.data;
  const cards = data?.cards;

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        description="Live marketplace health from the last activity window."
        action={
          <Button component={RouterLink} to="/reports" variant="outlined">
            Reports
          </Button>
        }
      />

      {query.isError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getApiErrorMessage(query.error)}
        </Alert>
      ) : null}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Revenue" value={formatMoney(cards?.revenueCents ?? 0)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Orders" value={cards?.ordersTotal ?? '—'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Available listings" value={cards?.listingsAvailable ?? '—'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Pending reviews" value={cards?.reviewsPending ?? '—'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Customers" value={cards?.customersTotal ?? '—'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Pending orders" value={cards?.ordersPending ?? '—'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Paid orders" value={cards?.paidOrders ?? '—'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Verified payments" value={cards?.paymentsVerified ?? '—'} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Sales (30 days)
            </Typography>
            <Stack spacing={1}>
              {(data?.salesLast30Days ?? []).slice(-7).map((day) => (
                <Stack key={day.date} direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2">{day.date}</Typography>
                  <Typography variant="body2">
                    {day.orders} orders · {formatMoney(day.revenueCents)}
                  </Typography>
                </Stack>
              ))}
              {!data?.salesLast30Days?.length ? (
                <Typography color="text.secondary">No sales data yet.</Typography>
              ) : null}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2.5, pb: 1 }}>
              Recent orders
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.recentOrders ?? []).map((o) => (
                  <TableRow key={o._id} hover>
                    <TableCell>
                      <Button component={RouterLink} to="/orders" size="small" sx={{ px: 0 }}>
                        {o.orderNumber}
                      </Button>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block' }}
                      >
                        {formatDate(o.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>{o.status}</TableCell>
                    <TableCell align="right">{formatMoney(o.total, o.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
