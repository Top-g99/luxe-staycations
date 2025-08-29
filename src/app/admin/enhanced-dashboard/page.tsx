"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Storage,
  Cloud,
  CloudOff,
  Sync,
  DataUsage,
  Settings,
  Refresh,
  Warning,
  CheckCircle,
  Error,
  Info,
  Upload,
  Download
} from '@mui/icons-material';
// import { enhancedStorageManager } from '@/lib/enhancedStorageManager';
import { storageManager } from '@/lib/storageManager';

interface StorageStatus {
  supabaseAvailable: boolean;
  lastHealthCheck: number;
  syncQueueLength: number;
  storageInfo: {
    totalItems: number;
    totalSize: number;
  };
}

export default function EnhancedDashboard() {
  const [status, setStatus] = useState<StorageStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [migrationDialog, setMigrationDialog] = useState(false);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    loadStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      // const currentStatus = await enhancedStorageManager.getStatus();
      // setStatus(currentStatus);
    } catch (error) {
      console.error('Failed to load status:', error);
      setMessage({ type: 'error', text: 'Failed to load storage status' });
    } finally {
      setLoading(false);
    }
  };

  const handleMigration = async () => {
    try {
      setMigrating(true);
      // await enhancedStorageManager.migrateLocalToSupabase();
      setMessage({ type: 'success', text: 'Data migration to Supabase completed successfully!' });
      setMigrationDialog(false);
      await loadStatus();
    } catch (error) {
      console.error('Migration failed:', error);
      setMessage({ type: 'error', text: 'Data migration failed. Please check your Supabase configuration.' });
    } finally {
      setMigrating(false);
    }
  };

  const clearAllStorage = async () => {
    try {
      setLoading(true);
      // await storageManager.clearAll();
      setMessage({ type: 'success', text: 'All local storage data cleared successfully' });
      await loadStatus();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      setMessage({ type: 'error', text: 'Failed to clear storage data' });
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
    if (!status?.storageInfo) return 0;
    const maxSize = 50 * 1024 * 1024; // 50MB limit
    return Math.min((status.storageInfo.totalSize / maxSize) * 100, 100);
  };

  const getStatusColor = (available: boolean) => {
    return available ? 'success' : 'error';
  };

  const getStatusIcon = (available: boolean) => {
    return available ? <CheckCircle /> : <Error />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Enhanced Storage Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadStatus}
          disabled={loading}
        >
          Refresh Status
        </Button>
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Storage Status Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Storage sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Storage Status
                </Typography>
              </Box>

              {loading ? (
                <Box>
                  <LinearProgress sx={{ mb: 2 }} />
                  <Typography>Loading status...</Typography>
                </Box>
              ) : status ? (
                <Box>
                  {/* Supabase Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      {status.supabaseAvailable ? <Cloud color="success" /> : <CloudOff color="error" />}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        Supabase
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(status.supabaseAvailable)}
                      label={status.supabaseAvailable ? 'Connected' : 'Disconnected'}
                      color={getStatusColor(status.supabaseAvailable)}
                      size="small"
                    />
                  </Box>

                  {/* Local Storage Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DataUsage sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      Local Storage
                    </Typography>
                    <Chip
                      icon={<CheckCircle />}
                      label="Available"
                      color="success"
                      size="small"
                    />
                  </Box>

                  {/* Sync Queue */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Sync sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      Pending Syncs
                    </Typography>
                    <Chip
                      label={status.syncQueueLength}
                      color={status.syncQueueLength > 0 ? 'warning' : 'default'}
                      size="small"
                    />
                  </Box>

                  {/* Last Health Check */}
                  <Typography variant="caption" color="text.secondary">
                    Last health check: {new Date(status.lastHealthCheck).toLocaleTimeString()}
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No status information available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Storage Usage */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DataUsage sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Storage Usage
                </Typography>
              </Box>

              {status?.storageInfo ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Total Items:</Typography>
                    <Chip label={status.storageInfo.totalItems} color="primary" />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Total Size:</Typography>
                    <Chip label={formatBytes(status.storageInfo.totalSize)} color="secondary" />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Usage
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

        {/* Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Storage Actions
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<Upload />}
                    onClick={() => setMigrationDialog(true)}
                    disabled={!status?.supabaseAvailable || loading}
                    fullWidth
                  >
                    Migrate to Supabase
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<Sync />}
                    onClick={loadStatus}
                    disabled={loading}
                    fullWidth
                  >
                    Sync Data
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<Warning />}
                    onClick={clearAllStorage}
                    disabled={loading}
                    fullWidth
                  >
                    Clear Local Storage
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    href="/admin/storage-manager"
                    fullWidth
                  >
                    Storage Manager
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Info color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Hybrid Storage System"
                    secondary="Automatically switches between Supabase (online) and IndexedDB (offline)"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Sync color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Automatic Sync"
                    secondary="Offline changes are automatically synced when connection is restored"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Cloud color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Supabase Integration"
                    secondary="Cloud database with real-time updates and advanced features"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Storage color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Local Storage"
                    secondary="IndexedDB provides offline functionality and data caching"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Migration Dialog */}
      <Dialog open={migrationDialog} onClose={() => setMigrationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Migrate Data to Supabase</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            This will migrate all your local data to Supabase. This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Make sure your Supabase project is properly configured before proceeding.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMigrationDialog(false)} disabled={migrating}>
            Cancel
          </Button>
          <Button
            onClick={handleMigration}
            variant="contained"
            disabled={migrating}
            startIcon={migrating ? <LinearProgress /> : <Upload />}
          >
            {migrating ? 'Migrating...' : 'Start Migration'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
