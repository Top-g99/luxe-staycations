'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Chip
} from '@mui/material';
import { Email, Send, CheckCircle, Error } from '@mui/icons-material';

export default function TestBrevoPage() {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTestEmail = async () => {
    if (!testEmail) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/brevo/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail }),
      });

      const data = await response.json();
      setResult({
        success: data.success,
        message: data.success ? `Test email sent successfully to ${testEmail}!` : data.error || 'Failed to send test email'
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Error sending test email'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          🧪 Brevo Email Service Test
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Test the Brevo email integration to ensure everything is working correctly
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Send Test Email
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  label="Test Email Address"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                  onClick={handleTestEmail}
                  disabled={loading || !testEmail}
                >
                  Send Test
                </Button>
              </Box>
              
              {result && (
                <Alert 
                  severity={result.success ? 'success' : 'error'}
                  icon={result.success ? <CheckCircle /> : <Error />}
                >
                  {result.message}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Brevo Integration Status
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<Email />} 
                  label="Email Templates" 
                  color="success" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<CheckCircle />} 
                  label="API Integration" 
                  color="success" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<CheckCircle />} 
                  label="Supabase Storage" 
                  color="success" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<CheckCircle />} 
                  label="Netlify Compatible" 
                  color="success" 
                  variant="outlined" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

