'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { propertyManager } from '@/lib/dataManager';

export default function PropertyDebugInfo() {
  const [properties, setProperties] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const loadProperties = async () => {
      const allProperties = await propertyManager.getAll();
      setProperties(allProperties);
      setLastUpdate(new Date());
    };

    // Initial load
    loadProperties();

    // Subscribe to updates
    const unsubscribe = propertyManager.subscribe(() => {
      console.log('PropertyDebugInfo: Received property update');
      loadProperties();
    });

    return unsubscribe;
  }, []);

  return (
    <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">
          🔍 Property Debug Info
        </Typography>
        <Button
          size="small"
          startIcon={<Refresh />}
          onClick={async () => {
            // DataManager doesn't have forceRefresh, just reload
            const allData = await propertyManager.getAll();
            setProperties(allData);
            setLastUpdate(new Date());
          }}
        >
          Refresh
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Chip label={`Total: ${properties.length}`} color="primary" size="small" />
        <Chip label={`Featured: ${properties.filter(p => p.featured).length}`} color="secondary" size="small" />
        <Chip label={`Last Update: ${lastUpdate ? `${lastUpdate.getHours().toString().padStart(2, '0')}:${lastUpdate.getMinutes().toString().padStart(2, '0')}:${lastUpdate.getSeconds().toString().padStart(2, '0')}` : '--:--:--'}`} color="info" size="small" />
      </Box>
      {properties.length > 0 && (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Properties:
          </Typography>
          {properties.map((property, index) => (
            <Box key={property.id} sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                {index + 1}. {property.name} - ₹{property.price} {property.featured ? '(Featured)' : ''}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', display: 'block' }}>
                Image: {property.image ? '✓ Set' : '✗ Missing'} | Type: {property.type}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}
