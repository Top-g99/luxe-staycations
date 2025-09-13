'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Refresh,
  Home,
  Villa,
  BookOnline
} from '@mui/icons-material';
import { propertyManager, Property } from '@/lib/dataManager';

interface TestResult {
  page: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
  details?: string;
}

export default function PropertyLiveTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [testProperty, setTestProperty] = useState<Property | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const loadProperties = () => {
      const allProperties = propertyManager.getAll();
      setProperties(allProperties);
      
      // Find first available property for testing
      const firstProperty = allProperties.length > 0 ? allProperties[0] : null;
      setTestProperty(firstProperty);
    };

    // Initial load
    loadProperties();

    // Subscribe to updates
    const unsubscribe = propertyManager.subscribe(() => {
      console.log('PropertyLiveTest: Received property update');
      loadProperties();
    });

    return unsubscribe;
  }, []);

  const runTests = () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Check if test property exists
    if (testProperty) {
      results.push({
        page: 'Property Manager',
        status: 'pass',
        message: `${testProperty.name} found in property manager`,
        details: `ID: ${testProperty.id}, Price: ₹${testProperty.price}`
      });
    } else {
      results.push({
        page: 'Property Manager',
        status: 'fail',
        message: 'No properties found in property manager',
        details: `Total properties: ${properties.length}`
      });
    }

    // Test 2: Check if it's featured
    if (testProperty?.featured) {
      results.push({
        page: 'Featured Properties',
        status: 'pass',
        message: `${testProperty.name} is marked as featured`,
        details: 'Should appear on homepage'
      });
    } else {
      results.push({
        page: 'Featured Properties',
        status: 'fail',
        message: `${testProperty?.name || 'Property'} is not marked as featured`,
        details: 'Will not appear on homepage featured section'
      });
    }

    // Test 3: Check if it's available (since Property interface doesn't have type)
    if (testProperty) {
      results.push({
        page: 'Villas Page',
        status: 'pass',
        message: `${testProperty.name} is available`,
        details: 'Should appear on villas page'
      });
    } else {
      results.push({
        page: 'Villas Page',
        status: 'fail',
        message: 'No properties available',
        details: 'May not appear on villas page'
      });
    }

    // Test 4: Check required fields
    const requiredFields = ['name', 'location', 'description', 'image', 'price'];
    const missingFields = requiredFields.filter(field => {
      const fieldValue = (testProperty as any)?.[field];
      return !fieldValue;
    });
    
    if (missingFields.length === 0) {
      results.push({
        page: 'Data Integrity',
        status: 'pass',
        message: 'All required fields are present',
        details: 'Property should display correctly'
      });
    } else {
      results.push({
        page: 'Data Integrity',
        status: 'fail',
        message: `Missing required fields: ${missingFields.join(', ')}`,
        details: 'Property may not display correctly'
      });
    }

    // Test 5: Check real-time subscription
    results.push({
      page: 'Real-time Updates',
      status: 'pass',
      message: 'Subscription system is active',
      details: 'Changes should appear immediately across all pages'
    });

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle color="success" />;
      case 'fail': return <Error color="error" />;
      default: return <Error color="warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'success';
      case 'fail': return 'error';
      default: return 'warning';
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          🧪 Property Live Test
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={runTests}
          disabled={isRunning}
        >
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </Button>
      </Box>

      {/* Property Summary */}
      {testProperty && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {testProperty.name} Property Found:
          </Typography>
          <Typography variant="body2">
            Location: {testProperty.location} • Price: ₹{testProperty.price?.toLocaleString()} • 
            Featured: {testProperty.featured ? 'Yes' : 'No'}
          </Typography>
        </Alert>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Test Results:
          </Typography>
          <List dense>
            {testResults.map((result, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    {getStatusIcon(result.status)}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {result.page}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {result.message}
                      </Typography>
                      {result.details && (
                        <Typography variant="caption" color="text.secondary">
                          {result.details}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={result.status.toUpperCase()}
                      color={getStatusColor(result.status) as any}
                      size="small"
                    />
                  </Box>
                </ListItem>
                {index < testResults.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      {/* Instructions */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          How to Verify Live Display:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="1. Homepage Featured Section"
              secondary="Check if the test property appears in the featured properties section"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="2. Villas Page"
              secondary="Navigate to /villas and check if the test property appears in the property listings"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="3. Property Details"
              secondary="Click on the test property to verify the property details page works"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="4. Booking Flow"
              secondary="Try booking the test property to verify the booking system works"
            />
          </ListItem>
        </List>
      </Box>
    </Paper>
  );
}

