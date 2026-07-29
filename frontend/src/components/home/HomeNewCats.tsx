'use client';

import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/lib/api/catalog';
import { HomeCatCarousel } from '@/components/home/HomeCatCarousel';

export function HomeNewCats() {
  const query = useQuery({
    queryKey: ['cats', 'new'],
    queryFn: () => catalogApi.listCats({ limit: 12, sort: '-createdAt' }),
  });

  return (
    <HomeCatCarousel
      title="New arrivals"
      subtitle="Fresh listings just added to the marketplace."
      cats={query.data?.data.cats ?? []}
      loading={query.isLoading}
      href="/cats?sort=-createdAt"
      linkLabel="See newest"
      autoPlayMs={4500}
    />
  );
}
