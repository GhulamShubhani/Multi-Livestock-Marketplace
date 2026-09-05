'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
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
  const [minPrice, setMinPrice] = React.useState('');
  const [maxPrice, setMaxPrice] = React.useState('');

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
    queryKey: ['categories', 'catalog'],
    queryFn: () => catalogApi.listCategories({ limit: 100 }),
  });

  const listings = listingsQuery.data?.data.listings ?? [];
  const meta = listingsQuery.data?.meta;
  const breeds = breedsQuery.data?.data.breeds ?? [];
  const categories = (categoriesQuery.data?.data.categories ?? [])
    .filter((c) => c.isActive !== false)
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const applySearch = () => {
    setFilters((f) => ({
      ...f,
      q: q.trim() || undefined,
      state: state.trim() || undefined,
      city: city.trim() || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setQ('');
    setState('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setFilters({
      page: 1,
      limit: 12,
      sort: '-createdAt',
      category: initialCategory,
    });
  };

  const activeCategory = filters.category || initialCategory;

  return (
    <Box
      sx={{
        background: `
          radial-gradient(900px 420px at 0% 0%, color-mix(in srgb, var(--brand) 10%, transparent), transparent 70%),
          radial-gradient(700px 360px at 100% 10%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 65%)
        `,
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={1.5} sx={{ mb: 4, maxWidth: 640 }}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontSize: { xs: '2.1rem', md: '2.9rem' },
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.75, fontSize: '1.05rem' }}>
            {subtitle}
          </Typography>
          {meta ? (
            <Typography variant="body2" color="text.secondary">
              {meta.total} listing{meta.total === 1 ? '' : 's'} found
              {activeCategory ? ` in ${activeCategory}` : ''}
            </Typography>
          ) : null}
        </Stack>

        {!hideCategoryFilter && categories.length > 0 ? (
          <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label="All animals"
              clickable
              color={!activeCategory ? 'secondary' : 'default'}
              variant={!activeCategory ? 'filled' : 'outlined'}
              onClick={() => setFilters((f) => ({ ...f, category: undefined, page: 1 }))}
            />
            {categories.map((c) => {
              const selected = activeCategory === c.slug;
              return (
                <Chip
                  key={c._id}
                  label={c.name}
                  clickable
                  color={selected ? 'secondary' : 'default'}
                  variant={selected ? 'filled' : 'outlined'}
                  component={Link}
                  href={`/animals/${c.slug}`}
                  sx={{ textDecoration: 'none' }}
                />
              );
            })}
          </Stack>
        ) : null}

        {hideCategoryFilter && categories.length > 1 ? (
          <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label="All animals"
              clickable
              component={Link}
              href="/animals"
              variant="outlined"
              sx={{ textDecoration: 'none' }}
            />
            {categories.map((c) => {
              const selected = activeCategory === c.slug;
              return (
                <Chip
                  key={c._id}
                  label={c.name}
                  clickable
                  color={selected ? 'secondary' : 'default'}
                  variant={selected ? 'filled' : 'outlined'}
                  component={Link}
                  href={`/animals/${c.slug}`}
                  sx={{ textDecoration: 'none' }}
                />
              );
            })}
          </Stack>
        ) : null}

        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            applySearch();
          }}
          sx={{
            mb: 4,
            p: { xs: 2, md: 2.5 },
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'color-mix(in srgb, var(--surface) 92%, var(--brand))',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ flexWrap: 'wrap' }}>
            <TextField
              label="Search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              size="small"
              placeholder="Breed, title, keyword"
              sx={{ minWidth: { md: 200 }, flex: 1.2 }}
            />
            <TextField
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              size="small"
              sx={{ minWidth: 130 }}
            />
            <TextField
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              size="small"
              sx={{ minWidth: 130 }}
            />
            <TextField
              label="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ''))}
              size="small"
              sx={{ width: { xs: '100%', md: 110 } }}
            />
            <TextField
              label="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ''))}
              size="small"
              sx={{ width: { xs: '100%', md: 110 } }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
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
              <FormControl size="small" sx={{ minWidth: 150 }}>
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
            <FormControl size="small" sx={{ minWidth: 120 }}>
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
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort</InputLabel>
              <Select
                label="Sort"
                value={filters.sort ?? '-createdAt'}
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value, page: 1 }))}
              >
                <MenuItem value="-createdAt">Newest</MenuItem>
                <MenuItem value="price">Price: low to high</MenuItem>
                <MenuItem value="-price">Price: high to low</MenuItem>
                <MenuItem value="title">Title A–Z</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit" variant="contained" color="secondary">
              Search
            </Button>
            <Button type="button" variant="text" onClick={clearFilters}>
              Clear
            </Button>
          </Stack>
        </Box>

        {listingsQuery.isLoading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Skeleton variant="rectangular" sx={{ aspectRatio: '4 / 5', mb: 1.5 }} />
                <Skeleton width="75%" sx={{ mb: 0.75 }} />
                <Skeleton width="45%" />
              </Grid>
            ))}
          </Grid>
        ) : listingsQuery.isError ? (
          <Box sx={{ py: 6 }}>
            <Typography color="error" sx={{ mb: 1 }}>
              Could not load listings.
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Check that the API is running, then try again.
            </Typography>
            <Button sx={{ mt: 2 }} variant="outlined" onClick={() => void listingsQuery.refetch()}>
              Retry
            </Button>
          </Box>
        ) : listings.length === 0 ? (
          <Box
            sx={{
              py: 8,
              px: 3,
              border: '1px dashed',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                fontSize: '1.5rem',
                mb: 1,
              }}
            >
              No animals match these filters
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2.5 }}>
              Try a different category, location, or clear filters to see all listings.
            </Typography>
            <Button variant="contained" color="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          </Box>
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
    </Box>
  );
}
