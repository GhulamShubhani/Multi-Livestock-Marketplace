import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Alert, Box } from '@mui/material';
import { useAuthStore } from '@/stores/auth';
import { hasAnyPermission } from '@/lib/utils';

type Props = {
  permissions?: string[];
};

export function PermissionGate({ permissions }: Props) {
  const user = useAuthStore((s) => s.user);

  if (permissions?.length && !hasAnyPermission(user?.permissions, permissions)) {
    return (
      <Box>
        <Alert severity="warning">You do not have permission to view this section.</Alert>
      </Box>
    );
  }

  return <Outlet />;
}

export function RequirePermission({ permissions, children }: Props & { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (permissions?.length && !hasAnyPermission(user?.permissions, permissions)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
