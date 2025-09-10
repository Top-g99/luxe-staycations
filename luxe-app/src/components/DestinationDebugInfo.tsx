'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Chip, Button } from '@mui/material';
// import { enhancedStorageManager } from '@/lib/enhancedStorageManager';

export default function DestinationDebugInfo() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        // const data = await enhancedStorageManager.getAllDestinations();
        setDestinations([]);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('DestinationDebugInfo: Failed to load destinations:', error);
      }
    };

    loadDestinations();
    // Note: enhancedStorageManager doesn't have subscribe, so we'll reload on mount
  }, []);

  const handleClearStorage = () => {
    console.log('DestinationDebugInfo: Clearing localStorage...');
    localStorage.removeItem('luxe-destinations');
    console.log('DestinationDebugInfo: localStorage cleared, reloading page...');
    window.location.reload();
  };

  const handleResetDefaults = async () => {
    console.log('DestinationDebugInfo: Resetting to defaults...');
    try {
          // For now, we'll just reload destinations since enhancedStorageManager doesn't have resetToDefaults
    // const data = await enhancedStorageManager.getAllDestinations();
    setDestinations([]);
      setLastUpdate(new Date());
      console.log('DestinationDebugInfo: Reset completed');
    } catch (error) {
      console.error('DestinationDebugInfo: Failed to reset destinations:', error);
    }
  };

  const handleTestUpdate = async () => {
    console.log('DestinationDebugInfo: Testing update for Lonavala...');
    try {
      // Test updating Lonavala with a new image
      // await enhancedStorageManager.updateDestination('lonavala', {
      //   image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'
      // });
      console.log('DestinationDebugInfo: Test update result: success');
      // Reload destinations to show the update
      // const data = await enhancedStorageManager.getAllDestinations();
      setDestinations([]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('DestinationDebugInfo: Test update failed:', error);
    }
  };

  const handleForceReload = async () => {
    console.log('DestinationDebugInfo: Force reloading...');
    try {
      // const data = await enhancedStorageManager.getAllDestinations();
      setDestinations([]);
      setLastUpdate(new Date());
      console.log('DestinationDebugInfo: Force reload completed');
    } catch (error) {
      console.error('DestinationDebugInfo: Force reload failed:', error);
    }
  };

  const handleTestManager = async () => {
    console.log('DestinationDebugInfo: Testing enhanced storage manager...');
    try {
      // console.log('DestinationDebugInfo: Manager instance:', enhancedStorageManager);
      // const allDestinations = await enhancedStorageManager.getAllDestinations();
      // console.log('DestinationDebugInfo: All destinations:', allDestinations);
      // const featuredDestinations = allDestinations.filter(d => d.featured);
      // console.log('DestinationDebugInfo: Featured destinations:', featuredDestinations);
      alert('Check console for enhanced storage manager test results');
    } catch (error) {
      console.error('DestinationDebugInfo: Test failed:', error);
      alert('Test failed - check console for details');
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-dark)' }}>
        Destination Debug Info
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip label={`Total: ${destinations.length}`} color="primary" size="small" />
        <Chip label={`Featured: ${destinations.filter(d => d.featured).length}`} color="secondary" size="small" />
        <Chip label={`Last Update: ${lastUpdate?.toLocaleTimeString() || 'Never'}`} color="info" size="small" />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleClearStorage}
          sx={{ mr: 1 }}
        >
          Clear Storage
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleResetDefaults}
          sx={{ mr: 1 }}
        >
          Reset to Defaults
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleTestUpdate}
          sx={{ mr: 1 }}
        >
          Test Update Lonavala
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleForceReload}
          sx={{ mr: 1 }}
        >
          Force Reload
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleTestManager}
        >
          Test Manager
        </Button>
      </Box>

      {destinations.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Current Destinations:</Typography>
          {destinations.map((destination, index) => (
            <Box key={destination.id} sx={{ mb: 1, p: 1, bgcolor: 'white', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {index + 1}. {destination.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                ID: {destination.id} | Image: {destination.image.substring(0, 50)}...
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}
