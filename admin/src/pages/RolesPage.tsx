import { Alert, Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { PageHeader } from '@/components/common/PageHeader';

const ROLE_HINTS = [
  { name: 'super_admin', note: 'Full access; bypasses permission checks.' },
  { name: 'admin', note: 'Most CRM modules except destructive system locks.' },
  { name: 'manager', note: 'Catalog, orders, and reports focused access.' },
  { name: 'staff', note: 'Operational day-to-day permissions.' },
  { name: 'customer', note: 'Storefront only — blocked from this admin app.' },
];

export function RolesPage() {
  return (
    <Box>
      <PageHeader
        title="Roles"
        description="Role assignment is managed on Users. Dedicated roles CRUD API is not mounted yet."
      />
      <Alert severity="info" sx={{ mb: 3 }}>
        Assign roles via Users → Edit → Role. Permission catalogs are seeded on the backend (`roles:*`,
        `permissions:read` exist for a future roles admin API).
      </Alert>
      <Stack spacing={1.5} sx={{ maxWidth: 640 }}>
        {ROLE_HINTS.map((role) => (
          <Paper key={role.name} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
              <Chip label={role.name} size="small" color="secondary" variant="outlined" />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {role.note}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
