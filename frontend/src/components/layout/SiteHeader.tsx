'use client';

import Link from 'next/link';
import {
  AppBar,
  Badge,
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
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useTheme } from 'next-themes';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useUiStore } from '@/stores/ui';
import { APP_NAME } from '@/lib/utils';

const navLinks = [
  { href: '/cats', label: 'Browse Cats' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const cartCount = useCartStore((s) => s.count());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);

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
          <Toolbar disableGutters sx={{ minHeight: 72, gap: 2 }}>
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
                mr: { md: 4 },
              }}
            >
              {APP_NAME}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1 }}>
              {navLinks.map((link) => (
                <Button key={link.href} component={Link} href={link.href} color="inherit">
                  {link.label}
                </Button>
              ))}
            </Stack>

            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <IconButton
                aria-label="Toggle theme"
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              >
                {resolvedTheme === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              </IconButton>
              <IconButton component={Link} href="/wishlist" aria-label="Wishlist">
                <Badge badgeContent={wishlistCount} color="secondary">
                  <FavoriteBorderIcon />
                </Badge>
              </IconButton>
              <IconButton component={Link} href="/cart" aria-label="Cart">
                <Badge badgeContent={cartCount} color="secondary">
                  <ShoppingBagOutlinedIcon />
                </Badge>
              </IconButton>
              <Button
                component={Link}
                href="/auth/login"
                variant="contained"
                color="primary"
                sx={{ display: { xs: 'none', sm: 'inline-flex' }, ml: 1 }}
              >
                Sign in
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="left" open={mobileNavOpen} onClose={() => setMobileNavOpen(false)}>
        <Box sx={{ width: 280, p: 2 }} role="presentation">
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 700 }}>
              Menu
            </Typography>
            <IconButton aria-label="Close menu" onClick={() => setMobileNavOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <List>
            {navLinks.map((link) => (
              <ListItemButton
                key={link.href}
                component={Link}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
            <ListItemButton component={Link} href="/auth/login" onClick={() => setMobileNavOpen(false)}>
              <ListItemText primary="Sign in" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
