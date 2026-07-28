import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { useAuthStore } from '@/stores/auth';
import { hasPermission } from '@/lib/utils';
import { navSections } from '@/config/nav';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const canReadDashboard = hasPermission(user?.permissions, 'dashboard:read');

  const shortcuts = navSections
    .flatMap((s) => s.items)
    .filter((i) => i.path !== '/' && hasPermission(user?.permissions, i.permissions));

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 560 }}>
        Welcome{user ? `, ${user.firstName}` : ''}. Phase 9 ships the admin shell; module screens arrive in
        Phase 10.
      </Typography>

      {!canReadDashboard ? (
        <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography>You are signed in, but `dashboard:read` is not on this role.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Session
              </Typography>
              <Stack spacing={0.75}>
                <Typography variant="body2">Email: {user?.email}</Typography>
                <Typography variant="body2">Role: {user?.role}</Typography>
                <Typography variant="body2">Permissions: {user?.permissions.length ?? 0}</Typography>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Modules (coming next)
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {shortcuts.slice(0, 8).map((item) => (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    variant="outlined"
                    size="small"
                    startIcon={<item.icon fontSize="small" />}
                  >
                    {item.label}
                  </Button>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
