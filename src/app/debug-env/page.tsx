'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, Alert } from '@mui/material';

export default function DebugEnvPage() {
  const [envStatus, setEnvStatus] = useState<any>({});

  useEffect(() => {
    const checkEnv = () => {
      setEnvStatus({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL ? '✅ Set' : '❌ Missing',
        nodeEnv: process.env.NODE_ENV || 'Not set',
        isClient: typeof window !== 'undefined' ? 'Yes' : 'No',
        supabaseUrlValue: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
        supabaseKeyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Not set'
      });
    };

    checkEnv();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Environment Variables Debug
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Supabase Configuration
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography>
              <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {envStatus.supabaseUrl}
            </Typography>
            <Typography>
              <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {envStatus.supabaseAnonKey}
            </Typography>
            <Typography>
              <strong>NEXT_PUBLIC_BASE_URL:</strong> {envStatus.baseUrl}
            </Typography>
            <Typography>
              <strong>NODE_ENV:</strong> {envStatus.nodeEnv}
            </Typography>
            <Typography>
              <strong>Is Client Side:</strong> {envStatus.isClient}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Values (for debugging)
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
            <strong>Supabase URL:</strong> {envStatus.supabaseUrlValue}
          </Typography>
          <Typography variant="body2">
            <strong>Supabase Key:</strong> {envStatus.supabaseKeyValue}
          </Typography>
        </CardContent>
      </Card>

      {envStatus.supabaseUrl === '❌ Missing' && (
        <Alert severity="error">
          Supabase URL is missing! Please add NEXT_PUBLIC_SUPABASE_URL to your Netlify environment variables.
        </Alert>
      )}

      {envStatus.supabaseAnonKey === '❌ Missing' && (
        <Alert severity="error">
          Supabase Anon Key is missing! Please add NEXT_PUBLIC_SUPABASE_ANON_KEY to your Netlify environment variables.
        </Alert>
      )}

      {envStatus.supabaseUrl === '✅ Set' && envStatus.supabaseAnonKey === '✅ Set' && (
        <Alert severity="success">
          All Supabase environment variables are set! The database should be working.
        </Alert>
      )}
    </Container>
  );
}
