import type { Metadata } from 'next';
import { HomeHero } from '@/components/home/HomeHero';
import { HomeIntro } from '@/components/home/HomeIntro';
import { HomeNewCats } from '@/components/home/HomeNewCats';
import { HomeAdvertise } from '@/components/home/HomeAdvertise';
import { HomeBabyCats } from '@/components/home/HomeBabyCats';
import { HomeFeatured } from '@/components/home/HomeFeatured';
import { APP_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: `${APP_NAME} · Find your companion`,
  description: 'A calmer marketplace for adopting and welcoming cats into lasting homes.',
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeIntro />
      <HomeNewCats />
      <HomeAdvertise />
      <HomeBabyCats />
      <HomeFeatured />
    </>
  );
}
