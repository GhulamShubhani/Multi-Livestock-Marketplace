import { NavLink } from 'react-router-dom';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { navSections } from '@/config/nav';
import { useAuthStore } from '@/stores/auth';
import { hasAnyPermission, APP_NAME } from '@/lib/utils';
import { useUiStore } from '@/stores/ui';

const DRAWER_WIDTH = 260;

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const permissions = user?.permissions ?? [];

  const content = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 2.5 }}>
        <Box>
          <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, lineHeight: 1.2 }}>
            {APP_NAME}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Back office
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <Box sx={{ overflow: 'auto', py: 1, flexGrow: 1 }}>
        {navSections.map((section) => {
          const items = section.items.filter((item) =>
            hasAnyPermission(permissions, item.permissions ?? []),
          );
          if (!items.length) return null;
          return (
            <Box key={section.title} sx={{ mb: 1.5 }}>
              <Typography
                variant="caption"
                sx={{ px: 2.5, py: 1, display: 'block', color: 'text.secondary', letterSpacing: '0.06em' }}
              >
                {section.title.toUpperCase()}
              </Typography>
              <List dense disablePadding>
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <ListItemButton
                      key={item.path}
                      component={NavLink}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={() => {
                        if (window.matchMedia('(max-width:900px)').matches) setSidebarOpen(false);
                      }}
                      sx={{
                        mx: 1,
                        borderRadius: 2,
                        '&.active': {
                          backgroundColor: 'rgba(26, 58, 50, 0.1)',
                          color: 'primary.main',
                          '& .MuiListItemIcon-root': { color: 'primary.main' },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Icon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={item.placeholder ? 'Soon' : undefined}
                        slotProps={{
                          secondary: { sx: { fontSize: 11 } },
                        }}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        {content}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}

export const sidebarWidth = DRAWER_WIDTH;
