import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthGuard, GuestGuard } from '@/components/auth/AuthGuards';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ModulePlaceholderPage } from '@/pages/ModulePlaceholderPage';
import { navSections } from '@/config/nav';

const moduleRoutes = navSections
  .flatMap((s) => s.items)
  .filter((i) => i.path !== '/');

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
            {moduleRoutes.map((item) => (
              <Route
                key={item.path}
                path={item.path.slice(1)}
                element={<PermissionGate permissions={item.permissions} />}
              >
                <Route index element={<ModulePlaceholderPage />} />
              </Route>
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
