'use client';

import * as React from 'react';
import { useAuthStore } from '@/stores/auth';

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const status = useAuthStore((s) => s.status);

  React.useEffect(() => {
    if (status === 'idle') void bootstrap();
  }, [bootstrap, status]);

  return <>{children}</>;
}
