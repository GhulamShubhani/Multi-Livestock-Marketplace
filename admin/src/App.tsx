import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthGuard, GuestGuard } from '@/components/auth/AuthGuards';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { UsersPage } from '@/pages/UsersPage';
import { RolesPage } from '@/pages/RolesPage';
import { ListingsPage } from '@/pages/ListingsPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { AttributesPage } from '@/pages/AttributesPage';
import { BreedsPage } from '@/pages/BreedsPage';
import { EnquiriesPage } from '@/pages/EnquiriesPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { CouponsPage } from '@/pages/CouponsPage';
import { ReviewsPage } from '@/pages/ReviewsPage';
import { CmsPageView } from '@/pages/CmsPage';
import { BannersPage } from '@/pages/BannersPage';
import { HomepagePage } from '@/pages/HomepagePage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ActivityLogsPage } from '@/pages/ActivityLogsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestGuard />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<AuthGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route element={<PermissionGate permissions={['reports:read']} />}>
              <Route path="reports" element={<ReportsPage />} />
            </Route>
            <Route element={<PermissionGate permissions={['listings:read']} />}>
              <Route path="listings" element={<ListingsPage />} />
            </Route>
            <Route element={<PermissionGate permissions={['categories:read']} />}>
              <Route path="categories" element={<CategoriesPage />} />
            </Route>
            <Route element={<PermissionGate permissions={['attributes:read']} />}>
              <Route path="attributes" element={<AttributesPage />} />
            </Route>
            <Route element={<PermissionGate permissions={['breeds:read']} />}>
              <Route path="breeds" element={<BreedsPage />} />
            </Route>
            <Route element={<PermissionGate permissions={['enquiries:read']} />}>
              <Route path="enquiries" element={<EnquiriesPage />} />
            </Route>
            <Route element={<PermissionGate permissions={['orders:read']} />}>
              <Route path="orders" element={<OrdersPage />} />
            </Route>
            <Route element={<PermissionGate permissions={['payments:read']} />}>
              <Route path="payments" element={<PaymentsPage />} />
            </Route>
            <Route element={<PermissionGate permissions={['coupons:read']} />}>
              <Route path="coupons" element={<CouponsPage />} />
            </Route>
            <Route element={<PermissionGate permissions={['reviews:moderate']} />}>
              <Route path="reviews" element={<ReviewsPage />} />
            </Route>
            <Route element={<PermissionGate permissions={['cms:read']} />}>
              <Route path="cms" element={<CmsPageView />} />
            </Route>
            <Route element={<PermissionGate permissions={['banners:read']} />}>
              <Route path="banners" element={<BannersPage />} />
            </Route>
            <Route element={<PermissionGate permissions={['homepage:read']} />}>
              <Route path="homepage" element={<HomepagePage />} />
            </Route>
            <Route element={<PermissionGate permissions={['notifications:create']} />}>
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
            <Route element={<PermissionGate permissions={['users:read']} />}>
              <Route path="users" element={<UsersPage />} />
            </Route>
            <Route element={<PermissionGate permissions={['roles:read']} />}>
              <Route path="roles" element={<RolesPage />} />
            </Route>
            <Route element={<PermissionGate permissions={['activity_logs:read']} />}>
              <Route path="activity-logs" element={<ActivityLogsPage />} />
            </Route>
            <Route element={<PermissionGate permissions={['settings:read']} />}>
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
