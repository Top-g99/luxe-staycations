'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore,
  Refresh,
  Storage,
  Api,
  Computer,
  CloudSync
} from '@mui/icons-material';
import { propertyManager } from '@/lib/dataManager';

interface DataStatus {
  localProperties: number;
  apiProperties: number;
  lastSync: Date | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
}

export default function DataManagementPanel() {
  const [dataStatus, setDataStatus] = useState<DataStatus>({
    localProperties: 0,
    apiProperties: 0,
    lastSync: null,
    syncStatus: 'idle'
  });
  const [properties, setProperties] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | false>(false);

  useEffect(() => {
    loadDataStatus();
    
    // Subscribe to property updates
    const unsubscribe = propertyManager.subscribe(() => {
      loadDataStatus();
    });

    return unsubscribe;
  }, []);

  const loadDataStatus = async () => {
    try {
      // Get local properties
              const localProps = await propertyManager.getAll();
      setProperties(localProps);
      
      // Get API properties
      let apiProps = 0;
      try {
        const response = await fetch('/api/villas');
        if (response.ok) {
          const result = await response.json();
          apiProps = result.data?.length || 0;
        }
      } catch (error) {
        console.error('Error fetching API data:', error);
      }

      setDataStatus(prev => ({
        ...prev,
        localProperties: localProps.length,
        apiProperties: apiProps,
        lastSync: new Date()
      }));
    } catch (error) {
      console.error('Error loading data status:', error);
    }
  };

  const handleSync = async () => {
    setDataStatus(prev => ({ ...prev, syncStatus: 'syncing' }));
    
    try {
      await loadDataStatus();
      setDataStatus(prev => ({ ...prev, syncStatus: 'success' }));
      
      // Reset success status after 3 seconds
      setTimeout(() => {
        setDataStatus(prev => ({ ...prev, syncStatus: 'idle' }));
      }, 3000);
    } catch (error) {
      setDataStatus(prev => ({ ...prev, syncStatus: 'error' }));
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setDataStatus(prev => ({ ...prev, syncStatus: 'idle' }));
      }, 5000);
    }
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Storage />
          Data Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={dataStatus.syncStatus === 'syncing' ? <CircularProgress size={16} /> : <Refresh />}
          onClick={handleSync}
          disabled={dataStatus.syncStatus === 'syncing'}
        >
          Sync Data
        </Button>
      </Box>

      {/* Status Overview */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Chip
          icon={<Computer />}
          label={`Local: ${dataStatus.localProperties} properties`}
          color="primary"
          variant="outlined"
        />
        <Chip
          icon={<Api />}
          label={`API: ${dataStatus.apiProperties} properties`}
          color="secondary"
          variant="outlined"
        />
        <Chip
          icon={<CloudSync />}
          label={`Last Sync: ${dataStatus.lastSync ? `${dataStatus.lastSync.getHours().toString().padStart(2, '0')}:${dataStatus.lastSync.getMinutes().toString().padStart(2, '0')}:${dataStatus.lastSync.getSeconds().toString().padStart(2, '0')}` : 'Never'}`}
          color="info"
          variant="outlined"
        />
      </Box>

      {/* Sync Status Alert */}
      {dataStatus.syncStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Data synchronized successfully!
        </Alert>
      )}
      {dataStatus.syncStatus === 'error' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error synchronizing data. Please try again.
        </Alert>
      )}

      {/* Data Details */}
      <Accordion expanded={expanded === 'properties'} onChange={handleAccordionChange('properties')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">
            Properties Data ({properties.length} items)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {properties.length > 0 ? (
            <List dense>
              {properties.map((property, index) => (
                <React.Fragment key={property.id}>
                  <ListItem>
                    <ListItemText
                      disableTypography
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {property.name}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {property.location} • ₹{property.price.toLocaleString()}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            {property.featured && <Chip label="Featured" size="small" color="primary" />}
                            <Chip label={property.type} size="small" variant="outlined" />
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                  {index < properties.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">
              No properties found in local storage.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'storage'} onChange={handleAccordionChange('storage')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">
            Storage Information
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            <strong>Local Storage:</strong> Properties are saved in browser localStorage for immediate access and offline functionality.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>API Storage:</strong> Properties are also saved to the server API endpoints for persistence across sessions and devices.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Real-time Sync:</strong> Changes made in the admin panel are immediately reflected across all pages and saved to both local and API storage.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
