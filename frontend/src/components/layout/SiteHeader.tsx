'use client';

import Link from 'next/link';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from 'next-themes';
import { useUiStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import { APP_NAME } from '@/lib/utils';

const guestLinks = [
  { href: '/', label: 'Home' },
  { href: '/animals', label: 'Animals', requiresAuth: true },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const authExtraLinks = [
  { href: '/profile', label: 'My listings' },
  { href: '/profile', label: 'Enquiries' },
  { href: '/profile', label: 'Profile' },
];

function navHref(href: string, requiresAuth: boolean | undefined, isAuthed: boolean) {
  if (requiresAuth && !isAuthed) {
    return `/auth/login?next=${encodeURIComponent(href)}`;
  }
  return href;
}

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const user = useAuthStore((s) => s.user);
  const isAuthed = Boolean(user);

  const mobileLinks = user ? [...guestLinks, ...authExtraLinks] : guestLinks;

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          backdropFilter: 'blur(14px)',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(12, 23, 20, 0.72)' : 'rgba(247, 244, 239, 0.72)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 72, gap: 1.5 }}>
            <IconButton
              edge="start"
              aria-label="Open menu"
              onClick={() => setMobileNavOpen(true)}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              component={Link}
              href="/"
              variant="h6"
              sx={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'text.primary',
                textDecoration: 'none',
                flexGrow: { xs: 1, md: 0 },
                mr: { md: 2 },
                whiteSpace: 'nowrap',
              }}
            >
              {APP_NAME}
            </Typography>

            <Stack
              direction="row"
              spacing={0.25}
              sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, flexWrap: 'wrap' }}
            >
              {guestLinks.map((link) => (
                <Button
                  key={`${link.href}-${link.label}`}
                  component={Link}
                  href={navHref(link.href, link.requiresAuth, isAuthed)}
                  color="inherit"
                >
                  {link.label}
                </Button>
              ))}
              {user
                ? authExtraLinks.map((link) => (
                    <Button
                      key={`${link.href}-${link.label}`}
                      component={Link}
                      href={link.href}
                      color="inherit"
                    >
                      {link.label}
                    </Button>
                  ))
                : null}
            </Stack>

            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <IconButton component={Link} href="/search" aria-label="Search">
                <SearchIcon />
              </IconButton>
              <IconButton
                aria-label="Toggle theme"
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              >
                {resolvedTheme === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              </IconButton>
              {user ? (
                <Button
                  component={Link}
                  href="/profile"
                  variant="contained"
                  color="primary"
                  startIcon={<PersonOutlinedIcon />}
                  sx={{ display: { xs: 'none', sm: 'inline-flex' }, ml: 1 }}
                >
                  {user.firstName}
                </Button>
              ) : (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ display: { xs: 'none', sm: 'flex' }, ml: 1 }}
                >
                  <Button component={Link} href="/auth/login" color="inherit">
                    Sign in
                  </Button>
                  <Button
                    component={Link}
                    href="/auth/register"
                    variant="contained"
                    color="primary"
                  >
                    Get started
                  </Button>
                </Stack>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="left" open={mobileNavOpen} onClose={() => setMobileNavOpen(false)}>
        <Box sx={{ width: 280, p: 2 }} role="presentation">
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
          >
            <Typography
              sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 700 }}
            >
              Menu
            </Typography>
            <IconButton aria-label="Close menu" onClick={() => setMobileNavOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <List>
            {mobileLinks.map((link) => {
              const requiresAuth = 'requiresAuth' in link ? Boolean(link.requiresAuth) : false;
              return (
                <ListItemButton
                  key={`${link.href}-${link.label}`}
                  component={Link}
                  href={navHref(link.href, requiresAuth, isAuthed)}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <ListItemText primary={link.label} />
                </ListItemButton>
              );
            })}
            <ListItemButton component={Link} href="/search" onClick={() => setMobileNavOpen(false)}>
              <ListItemText primary="Search" />
            </ListItemButton>
            {!user ? (
              <>
                <ListItemButton
                  component={Link}
                  href="/auth/login"
                  onClick={() => setMobileNavOpen(false)}
                >
                  <ListItemText primary="Sign in" />
                </ListItemButton>
                <ListItemButton
                  component={Link}
                  href="/auth/register"
                  onClick={() => setMobileNavOpen(false)}
                >
                  <ListItemText primary="Get started" />
                </ListItemButton>
              </>
            ) : null}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
