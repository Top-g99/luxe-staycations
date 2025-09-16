'use client';

import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { createClient } from '@supabase/supabase-js';

export default function CheckDatabasePage() {
  const [status, setStatus] = useState({
    connection: 'checking',
    tables: {},
    error: null as string | null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    setLoading(true);
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        setStatus({
          connection: 'error',
          tables: {},
          error: 'Missing Supabase credentials'
        });
        return;
      }

      const supabase = getSupabaseClient();
      
      // Test connection
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      const { data: testData, error: testError } = await supabase
        .from('properties')
        .select('count')
        .limit(1);

      if (testError) {
        console.log('Connection test error:', testError);
      }

      // Check each table
      const tables = ['properties', 'destinations', 'deal_banners', 'hero_backgrounds'];
      const tableStatus: any = {};

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);

          if (error) {
            tableStatus[table] = {
              exists: false,
              error: error.message
            };
          } else {
            tableStatus[table] = {
              exists: true,
              count: data?.length || 0
            };
          }
        } catch (err) {
          tableStatus[table] = {
            exists: false,
            error: (err as any).message
          };
        }
      }

      setStatus({
        connection: testError ? 'error' : 'connected',
        tables: tableStatus,
        error: testError?.message || null
      });

    } catch (error) {
      setStatus({
        connection: 'error',
        tables: {},
        error: (error as any).message
      });
    } finally {
      setLoading(false);
    }
  };

  const getConnectionColor = () => {
    switch (status.connection) {
      case 'connected': return 'success';
      case 'error': return 'error';
      default: return 'warning';
    }
  };

  const getConnectionText = () => {
    switch (status.connection) {
      case 'connected': return 'Connected to Supabase';
      case 'error': return 'Error connecting to Supabase';
      default: return 'Checking connection...';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Database Status Check
      </Typography>

      <Button variant="contained" onClick={checkDatabase} sx={{ mb: 3 }}>
        Refresh Status
      </Button>

      <Alert severity={getConnectionColor()} sx={{ mb: 3 }}>
        {getConnectionText()}
        {status.error && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="inherit">
              Error: {status.error}
            </Typography>
          </Box>
        )}
      </Alert>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Table Status
          </Typography>
          
          <List>
            {Object.entries(status.tables).map(([tableName, tableInfo]) => {
              const info = tableInfo as any;
              return (
                <React.Fragment key={tableName}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {tableName}
                          </Typography>
                          <Alert 
                            severity={info.exists ? 'success' : 'error'} 
                            sx={{ py: 0, px: 1, fontSize: '0.75rem' }}
                          >
                            {info.exists ? 'EXISTS' : 'MISSING'}
                          </Alert>
                        </Box>
                      }
                      secondary={
                        info.exists ? (
                          `Records: ${info.count}`
                        ) : (
                          `Error: ${info.error}`
                        )
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>
        </CardContent>
      </Card>

      {Object.values(status.tables).some((table: any) => !table.exists) && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Database Tables Missing!
          </Typography>
          <Typography variant="body2" paragraph>
            Some tables are missing from your Supabase database. You need to:
          </Typography>
          <Typography variant="body2" component="div">
            1. Go to your Supabase Dashboard
            <br />
            2. Open the SQL Editor
            <br />
            3. Copy and paste the contents of <code>supabase-schema-updated.sql</code>
            <br />
            4. Run the SQL commands
            <br />
            5. Refresh this page
          </Typography>
        </Alert>
      )}
    </Container>
  );
}
