'use client';

import React from 'react';
import { Box, Container, Typography, Button, Alert } from '@mui/material';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Application Error
            </Typography>
            <Typography variant="body2" gutterBottom>
              A client-side error occurred. This is likely due to missing environment variables.
            </Typography>
            {this.state.error && (
              <Typography variant="body2" sx={{ mt: 2, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {this.state.error.message}
              </Typography>
            )}
          </Alert>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Quick Fix
            </Typography>
            <Typography variant="body2" gutterBottom>
              Please add these environment variables to your Netlify dashboard:
            </Typography>
            <Box sx={{ textAlign: 'left', mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
{`NEXT_PUBLIC_SUPABASE_URL = https://okphwjvhzofxevtmlapn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rcGh3anZoem9meGV2dG1sYXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODU4NjMsImV4cCI6MjA3MTQ2MTg2M30.xwb10Ff-7nCothbmnL8Kesp4n8TYyJLcdehPgrXLsUw
NEXT_PUBLIC_BASE_URL = https://silly-banoffee-445ea8.netlify.app`}
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()} 
              sx={{ mt: 2 }}
            >
              Reload Page
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}
