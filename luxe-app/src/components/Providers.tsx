'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BookingProvider } from '@/contexts/BookingContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { HostProvider } from '@/contexts/HostContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#5a3d35',
    },
    secondary: {
      main: '#d97706',
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    h1: {
      fontFamily: 'var(--font-playfair), ui-serif, Georgia, serif',
    },
    h2: {
      fontFamily: 'var(--font-playfair), ui-serif, Georgia, serif',
    },
    h3: {
      fontFamily: 'var(--font-playfair), ui-serif, Georgia, serif',
    },
    h4: {
      fontFamily: 'var(--font-playfair), ui-serif, Georgia, serif',
    },
    h5: {
      fontFamily: 'var(--font-playfair), ui-serif, Georgia, serif',
    },
    h6: {
      fontFamily: 'var(--font-playfair), ui-serif, Georgia, serif',
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationsProvider>
        <HostProvider>
          <BookingProvider>
            {children}
          </BookingProvider>
        </HostProvider>
      </NotificationsProvider>
    </ThemeProvider>
  );
}
