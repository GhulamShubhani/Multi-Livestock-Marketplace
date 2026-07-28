import type { ElementType } from 'react';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';

export type NavItem = {
  label: string;
  path: string;
  icon: ElementType;
  permissions?: string[];
  placeholder?: boolean;
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
        placeholder: true,
      },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { label: 'Cats', path: '/cats', icon: PetsOutlinedIcon, permissions: ['cats:read'], placeholder: true },
      {
        label: 'Categories',
        path: '/categories',
        icon: CategoryOutlinedIcon,
        permissions: ['categories:read'],
        placeholder: true,
      },
      { label: 'Breeds', path: '/breeds', icon: SpaOutlinedIcon, permissions: ['breeds:read'], placeholder: true },
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
        placeholder: true,
      },
      {
        label: 'Payments',
        path: '/payments',
        icon: PaymentsOutlinedIcon,
        permissions: ['payments:read'],
        placeholder: true,
      },
      {
        label: 'Coupons',
        path: '/coupons',
        icon: LocalOfferOutlinedIcon,
        permissions: ['coupons:read'],
        placeholder: true,
      },
      {
        label: 'Reviews',
        path: '/reviews',
        icon: RateReviewOutlinedIcon,
        permissions: ['reviews:moderate'],
        placeholder: true,
      },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'CMS', path: '/cms', icon: ArticleOutlinedIcon, permissions: ['cms:read'], placeholder: true },
      {
        label: 'Banners',
        path: '/banners',
        icon: ViewCarouselOutlinedIcon,
        permissions: ['banners:read'],
        placeholder: true,
      },
      {
        label: 'Notifications',
        path: '/notifications',
        icon: CampaignOutlinedIcon,
        permissions: ['notifications:read'],
        placeholder: true,
      },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Users', path: '/users', icon: PeopleOutlinedIcon, permissions: ['users:read'], placeholder: true },
      {
        label: 'Roles',
        path: '/roles',
        icon: AdminPanelSettingsOutlinedIcon,
        permissions: ['roles:read'],
        placeholder: true,
      },
      {
        label: 'Activity',
        path: '/activity-logs',
        icon: HistoryOutlinedIcon,
        permissions: ['activity_logs:read'],
        placeholder: true,
      },
      {
        label: 'Settings',
        path: '/settings',
        icon: SettingsOutlinedIcon,
        permissions: ['settings:read'],
        placeholder: true,
      },
    ],
  },
];
