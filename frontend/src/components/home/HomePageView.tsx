'use client';

import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Box, Skeleton } from '@mui/material';
import { catalogApi } from '@/lib/api/catalog';
import { HomeHero } from '@/components/home/HomeHero';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { AnimalCarousel } from '@/components/home/AnimalCarousel';
import { CategoryListingsSection } from '@/components/home/CategoryListingsSection';
import type { Category, HomepageSection, Listing } from '@/types/api';
import { inferImageSourceType } from '@/lib/image-source';

/** Show category carousel when active listing count exceeds this threshold */
const CAROUSEL_MIN_LISTINGS = 6;
const EARLY_CAROUSEL_LIMIT = 3;
const LISTINGS_PER_CATEGORY = 8;

const HomePromoSection = dynamic(
  () => import('@/components/home/HomePromoSection').then((m) => m.HomePromoSection),
  {
    loading: () => (
      <Box sx={{ py: 10 }}>
        <Skeleton
          variant="rectangular"
          sx={{ height: { xs: 240, md: 380 }, mx: { xs: 2, md: 8 } }}
        />
      </Box>
    ),
  },
);

function normalizeHref(url?: string) {
  if (!url) return '/animals';
  if (url.startsWith('/listings')) return url.replace('/listings', '/animals');
  if (url === '/sellers' || url === '/sell' || url.startsWith('/sell')) return '/contact';
  return url;
}

function promoFromSection(section: HomepageSection, index: number) {
  const imageSrc =
    section.image?.url ||
    'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1600&q=80';
  const cfg = section.config ?? {};
  const sourceTypeFromConfig =
    cfg.imageSourceType === 'ai' ||
    cfg.imageSourceType === 'external' ||
    cfg.imageSourceType === 'upload'
      ? cfg.imageSourceType
      : undefined;
  return {
    title: section.title || 'Featured animals',
    body:
      section.description ||
      section.subtitle ||
      'Browse trusted listings with clear photos, health notes, and seller contact.',
    imageSrc,
    imageAlt: section.image?.alt || section.title || 'Featured livestock',
    ctaHref: normalizeHref(section.ctaUrl),
    ctaLabel: section.ctaText || 'Browse listings',
    reverse: index % 2 === 1,
    tone: (index === 0 ? 'brand' : 'surface') as 'brand' | 'surface',
    sourceType: section.image?.sourceType ?? sourceTypeFromConfig ?? inferImageSourceType(imageSrc),
    sourceLabel:
      section.image?.sourceLabel ??
      (typeof cfg.imageSourceLabel === 'string' ? cfg.imageSourceLabel : undefined),
  };
}

export function HomePageView() {
  const homepageQuery = useQuery({
    queryKey: ['homepage'],
    queryFn: () => catalogApi.getHomepage(),
    staleTime: 60_000,
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories', 'home'],
    queryFn: () => catalogApi.listCategories({ limit: 100 }),
    staleTime: 60_000,
  });

  const newArrivalsQuery = useQuery({
    queryKey: ['listings', 'home', 'new-arrivals'],
    queryFn: () => catalogApi.listListings({ limit: 12, sort: '-createdAt' }),
    staleTime: 30_000,
  });

  const categories = useMemo(() => {
    return (categoriesQuery.data?.data.categories ?? [])
      .filter((c) => c.isActive !== false)
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [categoriesQuery.data]);

  const sections = useMemo(() => {
    return (homepageQuery.data?.data.sections ?? [])
      .filter((s) => s.isActive !== false)
      .slice()
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [homepageQuery.data]);

  const heroSection = sections.find((s) => s.type === 'hero') ?? null;
  const categoriesSection = sections.find((s) => s.type === 'categories');
  const promoSections = sections.filter((s) => s.type === 'promo' || s.type === 'banner');
  const ctaSection = sections.find((s) => s.type === 'cta');

  const categoriesWithListings = categories.filter((c) => (c.listingCount ?? 0) > 0);
  const carouselEligible = categories.filter((c) => (c.listingCount ?? 0) > CAROUSEL_MIN_LISTINGS);
  const earlyCarouselCats = carouselEligible.slice(0, EARLY_CAROUSEL_LIMIT);
  const lateCarouselCats = carouselEligible.slice(EARLY_CAROUSEL_LIMIT);

  const categoryListingQueries = useQueries({
    queries: categoriesWithListings.map((category) => ({
      queryKey: ['listings', 'home', 'category', category.slug],
      queryFn: () =>
        catalogApi.listListings({
          category: category.slug,
          limit: LISTINGS_PER_CATEGORY,
          sort: '-createdAt',
        }),
      staleTime: 30_000,
      enabled: categoriesWithListings.length > 0,
    })),
  });

  const listingsBySlug = useMemo(() => {
    const map = new Map<string, { listings: Listing[]; loading: boolean }>();
    categoriesWithListings.forEach((cat, i) => {
      const q = categoryListingQueries[i];
      map.set(cat.slug, {
        listings: q?.data?.data.listings ?? [],
        loading: Boolean(q?.isLoading),
      });
    });
    return map;
  }, [categoriesWithListings, categoryListingQueries]);

  const newArrivals = newArrivalsQuery.data?.data.listings ?? [];

  const defaultPromos =
    promoSections.length === 0
      ? [
          {
            title: 'Companions that feel like home',
            body: 'Browse honest cat listings with clear photos, health notes, and seller contact — so you can match with confidence.',
            imageSrc:
              'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=1600&q=80',
            imageAlt: 'A soft grey cat nestled in warm light',
            ctaHref: '/cats',
            ctaLabel: 'Browse cats',
            reverse: false,
            tone: 'brand' as const,
            sourceType: 'external' as const,
            sourceLabel: 'External · Unsplash',
          },
        ]
      : promoSections.map(promoFromSection);

  return (
    <>
      {/* Hero paints immediately; CMS copy overlays when ready */}
      <HomeHero heroSection={heroSection} categories={categories} />

      <CategoryGrid
        categories={categories}
        loading={categoriesQuery.isLoading}
        title={categoriesSection?.title || 'Browse by animal'}
        subtitle={
          categoriesSection?.subtitle ||
          'Cats, cattle, goats, sheep, and poultry from trusted sellers.'
        }
      />

      {/* 2. Early dynamic category carousels (only when > 6 listings) */}
      {earlyCarouselCats.map((category) => {
        const data = listingsBySlug.get(category.slug);
        return (
          <AnimalCarousel
            key={`early-${category.slug}`}
            title={category.name}
            subtitle={`Explore ${category.name.toLowerCase()} from sellers across India.`}
            listings={data?.listings ?? []}
            loading={data?.loading ?? categoriesQuery.isLoading}
            href={`/animals/${category.slug}`}
            linkLabel={`See more ${category.name.toLowerCase()}`}
          />
        );
      })}

      {/* 3. Category listing grids — data-driven for every category with listings */}
      {categoriesWithListings.map((category) => {
        const data = listingsBySlug.get(category.slug);
        return (
          <CategoryListingsSection
            key={`grid-${category.slug}`}
            title={`${category.name} listings`}
            subtitle={`Available ${category.name.toLowerCase()} with photos, price, and location.`}
            listings={data?.listings ?? []}
            loading={data?.loading ?? false}
            href={`/animals/${category.slug}`}
            linkLabel={`View all ${category.name.toLowerCase()}`}
            limit={4}
          />
        );
      })}

      {/* 4. Promotional banner(s) from CMS */}
      {defaultPromos.map((promo, i) => (
        <HomePromoSection key={`promo-${i}`} {...promo} />
      ))}

      {/* 5. New arrivals */}
      <AnimalCarousel
        title="New arrivals"
        subtitle="The newest animal listings across every category."
        listings={newArrivals}
        loading={newArrivalsQuery.isLoading}
        href="/animals"
        linkLabel="Browse all"
      />

      {/* 6. Remaining category-specific carousels */}
      {lateCarouselCats.map((category) => {
        const data = listingsBySlug.get(category.slug);
        return (
          <AnimalCarousel
            key={`late-${category.slug}`}
            title={`${category.name} only`}
            subtitle={`Dedicated picks from our ${category.name.toLowerCase()} catalog.`}
            listings={data?.listings ?? []}
            loading={data?.loading ?? false}
            href={`/animals/${category.slug}`}
            linkLabel={`Browse ${category.name.toLowerCase()}`}
          />
        );
      })}

      {/* 7. Featured / CTA from CMS — skip sell-focused sections */}
      {ctaSection && !/sell/i.test(`${ctaSection.key} ${ctaSection.title} ${ctaSection.ctaUrl}`) ? (
        <HomePromoSection
          title={ctaSection.title || 'Explore the marketplace'}
          body={
            ctaSection.description ||
            ctaSection.subtitle ||
            'Browse trusted listings with clear photos, health notes, and seller contact.'
          }
          imageSrc={
            ctaSection.image?.url ||
            'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=1600&q=80'
          }
          imageAlt={ctaSection.image?.alt || 'Livestock marketplace'}
          ctaHref={normalizeHref(ctaSection.ctaUrl || '/animals')}
          ctaLabel={ctaSection.ctaText || 'Browse animals'}
          reverse
          sourceType={
            ctaSection.image?.sourceType ??
            inferImageSourceType(ctaSection.image?.url) ??
            'external'
          }
          sourceLabel={ctaSection.image?.sourceLabel}
        />
      ) : null}
    </>
  );
}

/** Exported for tests / future SSR helpers */
export function categoryEligibleForCarousel(category: Pick<Category, 'listingCount'>) {
  return (category.listingCount ?? 0) > CAROUSEL_MIN_LISTINGS;
}
