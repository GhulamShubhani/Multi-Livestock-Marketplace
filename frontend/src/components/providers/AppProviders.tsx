'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { makeQueryClient } from '@/lib/query/client';
import { darkTheme, lightTheme } from '@/theme/theme';
import { AuthBootstrap } from '@/components/providers/AuthBootstrap';

function MuiThemeBridge({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme();
  const theme = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => makeQueryClient());

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <QueryClientProvider client={queryClient}>
          <AuthBootstrap>
            <MuiThemeBridge>{children}</MuiThemeBridge>
          </AuthBootstrap>
        </QueryClientProvider>
      </NextThemesProvider>
    </AppRouterCacheProvider>
  );
}
