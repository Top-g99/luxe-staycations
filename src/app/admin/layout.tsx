'use client';

import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box>
      {/* Admin Header */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Luxe Staycations Admin Dashboard
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            No Authentication Required
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  );
}