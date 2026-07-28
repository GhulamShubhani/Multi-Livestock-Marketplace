'use client';

import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1A3A32', contrastText: '#F7F4EF' },
    secondary: { main: '#C9853A', contrastText: '#1A1A1A' },
    background: { default: '#F7F4EF', paper: '#FFFFFF' },
    text: { primary: '#1A2421', secondary: '#4A5C56' },
    divider: 'rgba(26, 58, 50, 0.12)',
  },
  typography: {
    fontFamily: 'var(--font-outfit), "Segoe UI", sans-serif',
    h1: { fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 600 },
    h2: { fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 600 },
    h3: { fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 20, paddingBlock: 10 },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#9BC4B8', contrastText: '#0C1714' },
    secondary: { main: '#E0A85C', contrastText: '#1A1A1A' },
    background: { default: '#0C1714', paper: '#14231E' },
    text: { primary: '#F2F6F4', secondary: '#B4C4BE' },
    divider: 'rgba(155, 196, 184, 0.16)',
  },
  typography: {
    fontFamily: 'var(--font-outfit), "Segoe UI", sans-serif',
    h1: { fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 600 },
    h2: { fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 600 },
    h3: { fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 20, paddingBlock: 10 },
      },
    },
  },
});
