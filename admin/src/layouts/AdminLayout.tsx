import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  Chip,
  IconButton,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Sidebar, sidebarWidth } from '@/layouts/Sidebar';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';

export function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, width: { md: `calc(100% - ${sidebarWidth}px)` } }}>
        <AppBar
          position="sticky"
          elevation={0}
          color="inherit"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton edge="start" onClick={toggleSidebar} sx={{ display: { md: 'none' } }} aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <Typography sx={{ flexGrow: 1, fontWeight: 600 }}>Admin console</Typography>
            {user ? (
              <>
                <Chip size="small" label={user.role.replace('_', ' ')} color="secondary" variant="outlined" />
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    void logout();
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : null}
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
