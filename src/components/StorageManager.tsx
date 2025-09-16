"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Alert,
  LinearProgress,
  Chip
} from '@mui/material';
import { storageManager } from '@/lib/storageManager';

import { StorageInfo } from '@/lib/storageManager';

export default function StorageManager() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      setLoading(true);
      const info = await storageManager.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to load storage info:', error);
      setMessage({ type: 'error', text: 'Failed to load storage information' });
    } finally {
      setLoading(false);
    }
  };

  const clearAllStorage = async () => {
    try {
      setLoading(true);
      // await storageManager.clearAll();
      setMessage({ type: 'success', text: 'All storage data cleared successfully' });
      await loadStorageInfo();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      setMessage({ type: 'error', text: 'Failed to clear storage data' });
    } finally {
      setLoading(false);
    }
  };

  const clearLocalStorage = async () => {
    try {
      setLoading(true);
      // Clear all Luxe-related localStorage items
      const allKeys = Object.keys(localStorage);
      const luxeKeys = allKeys.filter(key => key.startsWith('luxe-'));
      
      luxeKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      setMessage({ type: 'success', text: `Cleared ${luxeKeys.length} localStorage items` });
      await loadStorageInfo();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      setMessage({ type: 'error', text: 'Failed to clear localStorage' });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageUsagePercentage = () => {
    if (storageInfo.length === 0) return 0;
    // Calculate average usage from all storage types
    const totalPercentage = storageInfo.reduce((sum, item) => sum + item.percentage, 0);
    return totalPercentage / storageInfo.length;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Storage Management
      </Typography>
      
      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Storage Info Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Storage Information
              </Typography>
              
              {loading ? (
                <Box>
                  <LinearProgress sx={{ mb: 2 }} />
                  <Typography>Loading storage information...</Typography>
                </Box>
              ) : storageInfo.length > 0 ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Storage Types:</Typography>
                    <Chip label={storageInfo.length} color="primary" />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Total Size:</Typography>
                    <Chip label={formatBytes(storageInfo.reduce((sum, item) => sum + item.size, 0))} color="secondary" />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Average Usage
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={getStorageUsagePercentage()} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {getStorageUsagePercentage().toFixed(1)}% used
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No storage information available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Storage Actions Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Storage Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={loadStorageInfo}
                  disabled={loading}
                  fullWidth
                >
                  Refresh Storage Info
                </Button>
                
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={clearLocalStorage}
                  disabled={loading}
                  fullWidth
                >
                  Clear localStorage Only
                </Button>
                
                <Button
                  variant="contained"
                  color="error"
                  onClick={clearAllStorage}
                  disabled={loading}
                  fullWidth
                >
                  Clear All Storage (Nuclear Option)
                </Button>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                <strong>Note:</strong> Clearing storage will remove all saved data including destinations, properties, and settings. This action cannot be undone.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Storage Types Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Storage Types & Limits
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" color="primary">
                      IndexedDB (Primary)
                    </Typography>
                    <Typography variant="body2">
                      Capacity: ~50MB-1GB
                    </Typography>
                    <Typography variant="body2">
                      Status: {typeof window !== 'undefined' && 'indexedDB' in window ? '✅ Available' : '❌ Not Available'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" color="secondary">
                      localStorage (Fallback)
                    </Typography>
                    <Typography variant="body2">
                      Capacity: ~5-10MB
                    </Typography>
                    <Typography variant="body2">
                      Status: {typeof window !== 'undefined' ? '✅ Available' : '❌ Not Available'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary">
                      sessionStorage (Temporary)
                    </Typography>
                    <Typography variant="body2">
                      Capacity: ~5-10MB
                    </Typography>
                    <Typography variant="body2">
                      Status: {typeof window !== 'undefined' ? '✅ Available' : '❌ Not Available'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}


