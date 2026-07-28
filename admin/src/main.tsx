import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { App } from '@/App';
import { adminTheme } from '@/theme/theme';
import { makeQueryClient } from '@/lib/query';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/700.css';
import './index.css';

function Root() {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={adminTheme}>
          <CssBaseline />
          <SnackbarProvider maxSnack={3} autoHideDuration={4000}>
            <App />
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<Root />);
