"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';

export default function TestPage() {
  const [apiStatus, setApiStatus] = useState<string>('Testing...');
  const [testData, setTestData] = useState<any>(null);

  useEffect(() => {
    // Test API connection
    fetch('/api/test')
      .then(response => response.json())
      .then(data => {
        setApiStatus('✅ API Working');
        setTestData(data);
      })
      .catch(error => {
        setApiStatus('❌ API Error: ' + error.message);
      });
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" sx={{ mb: 4 }}>
        Test Page
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          API Status: {apiStatus}
        </Typography>
        
        {testData && (
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body1">
              <strong>Message:</strong> {testData.message}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Timestamp:</strong> {testData.timestamp}
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={() => window.location.href = '/'}
        >
          Go to Homepage
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => window.location.href = '/admin'}
        >
          Go to Admin
        </Button>
      </Box>
    </Container>
  );
}

