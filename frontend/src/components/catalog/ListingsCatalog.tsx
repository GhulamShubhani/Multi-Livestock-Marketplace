'use client';

import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { ListingsCatalogInner } from '@/components/catalog/ListingsCatalogInner';
import { RequireAuth } from '@/components/auth/RequireAuth';

type Props = {
  initialCategory?: string;
  title?: string;
  subtitle?: string;
  hideCategoryFilter?: boolean;
};

export function ListingsCatalog(props: Props) {
  return (
    <RequireAuth loadingLabel="Sign in required to browse animals…">
      <Suspense
        fallback={
          <Box sx={{ display: 'grid', placeItems: 'center', py: 16 }}>
            <CircularProgress />
          </Box>
        }
      >
        <ListingsCatalogInner {...props} />
      </Suspense>
    </RequireAuth>
  );
}
