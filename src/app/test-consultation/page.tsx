'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';

export default function TestConsultationPage() {
  const [message, setMessage] = useState('');

  const testAPI = async () => {
    try {
      const response = await fetch('/api/consultations');
      const data = await response.json();
      setMessage(`API Response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setMessage(`Error: ${error}`);
    }
  };

  const clearData = async () => {
    try {
      const { supabaseConsultationService } = await import('@/lib/supabaseConsultationService');
      await supabaseConsultationService.clearAllConsultations();
      setMessage('All consultation data cleared from database successfully!');
    } catch (error) {
      setMessage(`Error clearing data: ${error}`);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Simple Consultation Test
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button variant="contained" onClick={testAPI}>
          Test API
        </Button>
        <Button variant="outlined" color="error" onClick={clearData}>
          Clear Data
        </Button>
      </Box>

      {message && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {message}
          </Typography>
        </Box>
      )}
    </Container>
  );
}
