'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Alert, CircularProgress } from '@mui/material';
import { setupDatabase, insertSampleData } from '@/lib/setupDatabase';
import { supabase } from '@/lib/supabaseClient';

export default function TestDatabase() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('*')
        .limit(1);
      
      if (error) {
        setConnectionStatus('failed');
        setError(`Connection failed: ${error.message}`);
      } else {
        setConnectionStatus('connected');
        setStatus('Database connection successful!');
      }
    } catch (err) {
      setConnectionStatus('failed');
      setError(`Connection error: ${err}`);
    }
  };

  const handleSetupDatabase = async () => {
    setIsLoading(true);
    setError(null);
    setStatus('Setting up database...');
    
    try {
      const success = await setupDatabase();
      if (success) {
        setStatus('Database setup completed! Check console for SQL commands.');
      } else {
        setError('Database setup failed. Check console for details.');
      }
    } catch (err) {
      setError(`Setup error: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertSampleData = async () => {
    setIsLoading(true);
    setError(null);
    setStatus('Inserting sample data...');
    
    try {
      const success = await insertSampleData();
      if (success) {
        setStatus('Sample data inserted successfully!');
      } else {
        setError('Sample data insertion failed. Check console for details.');
      }
    } catch (err) {
      setError(`Sample data error: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'success';
      case 'failed': return 'error';
      default: return 'info';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'failed': return 'Failed';
      default: return 'Testing...';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Database Test & Setup
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Connection Status
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            {connectionStatus === 'testing' && <CircularProgress size={20} />}
            <Alert severity={getConnectionStatusColor() as any}>
              {getConnectionStatusText()}
            </Alert>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {status && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {status}
            </Alert>
          )}
          
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={testConnection}
              disabled={isLoading}
            >
              Test Connection
            </Button>
            <Button
              variant="outlined"
              onClick={handleSetupDatabase}
              disabled={isLoading || connectionStatus !== 'connected'}
            >
              Setup Database
            </Button>
            <Button
              variant="outlined"
              onClick={handleInsertSampleData}
              disabled={isLoading || connectionStatus !== 'connected'}
            >
              Insert Sample Data
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Instructions
          </Typography>
          <Typography variant="body2" paragraph>
            1. First, test the database connection to ensure Supabase is accessible.
          </Typography>
          <Typography variant="body2" paragraph>
            2. If connection is successful, click "Setup Database" to generate the SQL commands.
          </Typography>
          <Typography variant="body2" paragraph>
            3. Copy the SQL commands from the console and run them in your Supabase SQL editor.
          </Typography>
          <Typography variant="body2" paragraph>
            4. After creating the tables, click "Insert Sample Data" to add some test data.
          </Typography>
          <Typography variant="body2">
            5. Once sample data is inserted, the admin dashboard should work with real data.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
