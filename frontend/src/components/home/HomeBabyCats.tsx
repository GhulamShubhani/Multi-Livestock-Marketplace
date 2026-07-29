'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/lib/api/catalog';
import { HomeCatCarousel } from '@/components/home/HomeCatCarousel';

/** Baby / kitten age threshold in months. */
const BABY_MAX_MONTHS = 12;

export function HomeBabyCats() {
  const query = useQuery({
    queryKey: ['cats', 'babies'],
    queryFn: () => catalogApi.listCats({ limit: 24, sort: '-createdAt' }),
  });

  const babies = useMemo(() => {
    const all = query.data?.data.cats ?? [];
    return all.filter((cat) => cat.ageMonths <= BABY_MAX_MONTHS).slice(0, 12);
  }, [query.data]);

  return (
    <HomeCatCarousel
      title="Baby cats"
      subtitle="Young companions under a year — playful, curious, and ready to grow with you."
      cats={babies}
      loading={query.isLoading}
      href="/cats"
      linkLabel="Browse kittens"
      autoPlayMs={4800}
    />
  );
}
