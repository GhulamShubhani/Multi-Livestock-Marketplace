import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Container } from '@mui/material';
import { SearchPageView } from '@/components/search/SearchPageView';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search livestock and companion animal listings.',
};

export default function SearchPage() {
  return (
    <Suspense fallback={<Container sx={{ py: 10 }} />}>
      <SearchPageView />
    </Suspense>
  );
}
