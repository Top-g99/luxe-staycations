'use client';

import React from 'react';
import { Container, Typography, Box } from '@mui/material';

export default function TestSimple() {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box>
        <Typography variant="h3" component="h1" gutterBottom>
          Simple Test Page
        </Typography>
        <Typography variant="body1">
          This is a simple test page to check if Vercel deployment is working.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          If you can see this page, the basic Next.js setup is working correctly.
        </Typography>
      </Box>
    </Container>
  );
}
