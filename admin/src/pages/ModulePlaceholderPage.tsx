import { useLocation } from 'react-router-dom';
import { Alert, Box, Typography } from '@mui/material';
import { navSections } from '@/config/nav';

export function ModulePlaceholderPage() {
  const { pathname } = useLocation();
  const item = navSections.flatMap((s) => s.items).find((i) => i.path === pathname);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {item?.label ?? 'Module'}
      </Typography>
      <Alert severity="info">
        This module is scaffolded in the navigation. Full CRUD arrives in Phase 10.
      </Alert>
    </Box>
  );
}
