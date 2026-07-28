import { createTheme } from '@mui/material/styles';

export const adminTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1A3A32', contrastText: '#F7F4EF' },
    secondary: { main: '#C9853A', contrastText: '#1A1A1A' },
    background: { default: '#F3F1EC', paper: '#FFFFFF' },
    text: { primary: '#1A2421', secondary: '#4A5C56' },
    divider: 'rgba(26, 58, 50, 0.12)',
  },
  typography: {
    fontFamily: '"Outfit", "Segoe UI", sans-serif',
    h1: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 },
    h2: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 },
    h3: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 },
    h4: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 },
    h5: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 },
    h6: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 18 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(26, 58, 50, 0.12)',
          backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #F7F4EF 100%)',
        },
      },
    },
  },
});
