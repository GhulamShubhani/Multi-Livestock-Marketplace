'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
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
import { ListingCard } from '@/components/catalog/ListingCard';
import type { ListingsQuery } from '@/types/api';

type Props = {
  initialCategory?: string;
  title?: string;
  subtitle?: string;
  hideCategoryFilter?: boolean;
};

export function ListingsCatalogInner({
  initialCategory,
  title = 'Browse animals',
  subtitle = 'Filter by category, location, and gender to find the right animal.',
  hideCategoryFilter,
}: Props) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = React.useState<ListingsQuery>({
    page: 1,
    limit: 12,
    sort: '-createdAt',
    category: initialCategory,
    q: searchParams.get('q') || undefined,
    city: searchParams.get('city') || undefined,
    state: searchParams.get('state') || undefined,
  });
  const [q, setQ] = React.useState(searchParams.get('q') ?? '');
  const [state, setState] = React.useState(searchParams.get('state') ?? '');
  const [city, setCity] = React.useState(searchParams.get('city') ?? '');

  React.useEffect(() => {
    setFilters((f) => ({
      ...f,
      category: initialCategory,
      q: searchParams.get('q') || undefined,
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      page: 1,
    }));
    setQ(searchParams.get('q') ?? '');
    setCity(searchParams.get('city') ?? '');
    setState(searchParams.get('state') ?? '');
  }, [initialCategory, searchParams]);

  const listingsQuery = useQuery({
    queryKey: ['listings', filters],
    queryFn: () => catalogApi.listListings(filters),
  });

  const breedsQuery = useQuery({
    queryKey: ['breeds', filters.category],
    queryFn: () => catalogApi.listBreeds({ limit: 100, category: filters.category }),
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.listCategories({ limit: 100 }),
    enabled: !hideCategoryFilter,
  });

  const listings = listingsQuery.data?.data.listings ?? [];
  const meta = listingsQuery.data?.meta;
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
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 560 }}>
        {subtitle}
      </Typography>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ mb: 4, flexWrap: 'wrap' }}
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          setFilters((f) => ({
            ...f,
            q: q || undefined,
            state: state || undefined,
            city: city || undefined,
            page: 1,
          }));
        }}
      >
        <TextField
          label="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          size="small"
          sx={{ minWidth: { md: 200 } }}
        />
        <TextField
          label="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          size="small"
          sx={{ minWidth: 140 }}
        />
        <TextField
          label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          size="small"
          sx={{ minWidth: 140 }}
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
        {!hideCategoryFilter ? (
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
                <MenuItem key={c._id} value={c.slug}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null}
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
            <MenuItem value="title">Title</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained">
          Search
        </Button>
      </Stack>

      {listingsQuery.isLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : listingsQuery.isError ? (
        <Typography color="error">Could not load listings. Is the API running?</Typography>
      ) : listings.length === 0 ? (
        <Typography color="text.secondary">No animals match these filters yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {listings.map((listing) => (
            <Grid key={listing._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ListingCard listing={listing} />
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
