'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, Container, MenuItem, Stack, TextField, Typography } from '@mui/material';

const ANIMALS = [
  { value: '', label: 'All animals' },
  { value: 'cats', label: 'Cats' },
  { value: 'cows', label: 'Cows' },
  { value: 'buffaloes', label: 'Buffaloes' },
  { value: 'bulls', label: 'Bulls' },
  { value: 'goats', label: 'Goats' },
  { value: 'khassi', label: 'Khassi' },
  { value: 'chickens', label: 'Chickens' },
];

export function SearchPageView() {
  const router = useRouter();
  const search = useSearchParams();
  const [q, setQ] = React.useState(search.get('q') ?? '');
  const [animal, setAnimal] = React.useState(search.get('category') ?? '');
  const [location, setLocation] = React.useState(search.get('city') ?? '');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (location.trim()) params.set('city', location.trim());
    const base = animal ? `/animals/${animal}` : '/animals';
    const qs = params.toString();
    router.push(qs ? `${base}?${qs}` : base);
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 } }}>
      <Typography
        variant="h2"
        sx={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontSize: { xs: '2rem', md: '2.6rem' },
          mb: 1,
        }}
      >
        Search
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Find animals by type, keyword, or location.
      </Typography>
      <Box component="form" onSubmit={onSubmit}>
        <Stack spacing={2}>
          <TextField
            select
            label="Animal"
            value={animal}
            onChange={(e) => setAnimal(e.target.value)}
          >
            {ANIMALS.map((opt) => (
              <MenuItem key={opt.label} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Keyword"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Breed, title…"
          />
          <TextField
            label="City / location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Button type="submit" variant="contained" color="secondary" size="large">
            Search listings
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
