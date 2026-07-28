'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useCartStore } from '@/stores/cart';
import { formatMoney } from '@/lib/utils';

export function CartPageView() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalCents = useCartStore((s) => s.totalCents);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return <Container sx={{ py: 10 }} />;
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Typography
        variant="h2"
        sx={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: { xs: '2rem', md: '2.6rem' }, mb: 4 }}
      >
        Cart
      </Typography>

      {items.length === 0 ? (
        <Stack spacing={2}>
          <Typography color="text.secondary">Your cart is empty.</Typography>
          <Button component={Link} href="/cats" variant="contained" sx={{ alignSelf: 'flex-start' }}>
            Browse cats
          </Button>
        </Stack>
      ) : (
        <Stack spacing={3}>
          {items.map((item) => (
            <Stack
              key={item.catId}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                alignItems: { sm: 'center' },
              }}
            >
              <Box
                sx={{
                  width: { xs: '100%', sm: 96 },
                  height: 96,
                  overflow: 'hidden',
                  backgroundColor: 'action.hover',
                  flexShrink: 0,
                }}
              >
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : null}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  component={Link}
                  href={`/cats/${item.slug}`}
                  sx={{ fontWeight: 600, textDecoration: 'none', color: 'text.primary' }}
                >
                  {item.name}
                </Typography>
                <Typography color="text.secondary">{formatMoney(item.price, item.currency)}</Typography>
              </Box>
              <TextField
                type="number"
                size="small"
                label="Qty"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.catId, Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                slotProps={{ htmlInput: { min: 1, max: 10 } }}
                sx={{ width: 96 }}
              />
              <Typography sx={{ minWidth: 88, fontWeight: 600 }}>
                {formatMoney(item.price * item.quantity, item.currency)}
              </Typography>
              <IconButton aria-label="Remove" onClick={() => removeItem(item.catId)}>
                <DeleteOutlinedIcon />
              </IconButton>
            </Stack>
          ))}

          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', pt: 2 }}>
            <Typography variant="h6">Total {formatMoney(totalCents())}</Typography>
            <Button component={Link} href="/checkout" variant="contained" color="secondary" size="large">
              Checkout
            </Button>
          </Stack>
        </Stack>
      )}
    </Container>
  );
}
