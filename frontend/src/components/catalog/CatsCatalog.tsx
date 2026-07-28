'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { catalogApi } from '@/lib/api/catalog';
import { CatCard } from '@/components/catalog/CatCard';
import type { CatsQuery } from '@/types/api';

export function CatsCatalog() {
  const [filters, setFilters] = React.useState<CatsQuery>({
    page: 1,
    limit: 12,
    sort: '-createdAt',
  });
  const [q, setQ] = React.useState('');

  const catsQuery = useQuery({
    queryKey: ['cats', filters],
    queryFn: () => catalogApi.listCats(filters),
  });

  const breedsQuery = useQuery({
    queryKey: ['breeds'],
    queryFn: () => catalogApi.listBreeds({ limit: 100 }),
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.listCategories({ limit: 100 }),
  });

  const cats = catsQuery.data?.data.cats ?? [];
  const meta = catsQuery.data?.meta;
  const breeds = breedsQuery.data?.data.breeds ?? [];
  const categories = categoriesQuery.data?.data.categories ?? [];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
      <Typography
        variant="h2"
        sx={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontSize: { xs: '2rem', md: '2.75rem' },
          mb: 1,
        }}
      >
        Browse cats
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 520 }}>
        Filter by breed, category, and gender to find a companion that fits your home.
      </Typography>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ mb: 4, flexWrap: 'wrap' }}
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          setFilters((f) => ({ ...f, q: q || undefined, page: 1 }));
        }}
      >
        <TextField
          label="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          size="small"
          sx={{ minWidth: { md: 220 } }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Breed</InputLabel>
          <Select
            label="Breed"
            value={filters.breed ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, breed: e.target.value || undefined, page: 1 }))
            }
          >
            <MenuItem value="">All breeds</MenuItem>
            {breeds.map((b) => (
              <MenuItem key={b._id} value={b._id}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Category</InputLabel>
          <Select
            label="Category"
            value={filters.category ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, category: e.target.value || undefined, page: 1 }))
            }
          >
            <MenuItem value="">All categories</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Gender</InputLabel>
          <Select
            label="Gender"
            value={filters.gender ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, gender: e.target.value || undefined, page: 1 }))
            }
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Sort</InputLabel>
          <Select
            label="Sort"
            value={filters.sort ?? '-createdAt'}
            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value, page: 1 }))}
          >
            <MenuItem value="-createdAt">Newest</MenuItem>
            <MenuItem value="price">Price: low to high</MenuItem>
            <MenuItem value="-price">Price: high to low</MenuItem>
            <MenuItem value="name">Name</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained">
          Search
        </Button>
      </Stack>

      {catsQuery.isLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : catsQuery.isError ? (
        <Typography color="error">Could not load cats. Is the API running?</Typography>
      ) : cats.length === 0 ? (
        <Typography color="text.secondary">No cats match these filters yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {cats.map((cat) => (
            <Grid key={cat._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <CatCard cat={cat} />
            </Grid>
          ))}
        </Grid>
      )}

      {meta && meta.totalPages > 1 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Pagination
            count={meta.totalPages}
            page={meta.page}
            onChange={(_, page) => setFilters((f) => ({ ...f, page }))}
            color="primary"
          />
        </Box>
      ) : null}
    </Container>
  );
}
