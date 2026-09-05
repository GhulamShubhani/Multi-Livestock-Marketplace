import type { ElementType } from 'react';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';

export type NavItem = {
  label: string;
  path: string;
  icon: ElementType;
  permissions?: string[];
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        path: '/',
        icon: DashboardOutlinedIcon,
        permissions: ['dashboard:read'],
      },
      {
        label: 'Reports',
        path: '/reports',
        icon: AssessmentOutlinedIcon,
        permissions: ['reports:read'],
      },
    ],
  },
  {
    title: 'Marketplace',
    items: [
      {
        label: 'All Listings',
        path: '/listings',
        icon: PetsOutlinedIcon,
        permissions: ['listings:read'],
      },
    ],
  },
  {
    title: 'Animals',
    items: [
      {
        label: 'Categories',
        path: '/categories',
        icon: CategoryOutlinedIcon,
        permissions: ['categories:read'],
      },
      {
        label: 'Attributes',
        path: '/attributes',
        icon: TuneOutlinedIcon,
        permissions: ['attributes:read'],
      },
      { label: 'Breeds', path: '/breeds', icon: SpaOutlinedIcon, permissions: ['breeds:read'] },
    ],
  },
  {
    title: 'Users',
    items: [
      { label: 'Users', path: '/users', icon: PeopleOutlinedIcon, permissions: ['users:read'] },
      {
        label: 'Enquiries',
        path: '/enquiries',
        icon: QuestionAnswerOutlinedIcon,
        permissions: ['enquiries:read'],
      },
    ],
  },
  {
    title: 'Commerce',
    items: [
      {
        label: 'Orders',
        path: '/orders',
        icon: ShoppingBagOutlinedIcon,
        permissions: ['orders:read'],
      },
      {
        label: 'Payments',
        path: '/payments',
        icon: PaymentsOutlinedIcon,
        permissions: ['payments:read'],
      },
      {
        label: 'Coupons',
        path: '/coupons',
        icon: LocalOfferOutlinedIcon,
        permissions: ['coupons:read'],
      },
      {
        label: 'Reviews',
        path: '/reviews',
        icon: RateReviewOutlinedIcon,
        permissions: ['reviews:moderate'],
      },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'CMS', path: '/cms', icon: ArticleOutlinedIcon, permissions: ['cms:read'] },
      {
        label: 'Banners',
        path: '/banners',
        icon: ViewCarouselOutlinedIcon,
        permissions: ['banners:read'],
      },
      {
        label: 'Homepage',
        path: '/homepage',
        icon: HomeOutlinedIcon,
        permissions: ['homepage:read'],
      },
      {
        label: 'Notifications',
        path: '/notifications',
        icon: CampaignOutlinedIcon,
        permissions: ['notifications:create'],
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        label: 'Roles',
        path: '/roles',
        icon: AdminPanelSettingsOutlinedIcon,
        permissions: ['roles:read'],
      },
      {
        label: 'Activity',
        path: '/activity-logs',
        icon: HistoryOutlinedIcon,
        permissions: ['activity_logs:read'],
      },
      {
        label: 'Settings',
        path: '/settings',
        icon: SettingsOutlinedIcon,
        permissions: ['settings:read'],
      },
    ],
  },
];
