"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { supabasePropertyManager } from '@/lib/supabasePropertyManager';
import { supabaseDestinationManager } from '@/lib/supabaseDestinationManager';
import { supabaseBookingManager } from '@/lib/supabaseBookingManager';
import { supabaseCallbackManager } from '@/lib/supabaseCallbackManager';
import { supabaseDealBannerManager } from '@/lib/supabaseDealBannerManager';
import { isSupabaseAvailable, getSupabaseClient } from '@/lib/supabase';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`manager-tabpanel-${index}`}
      aria-labelledby={`manager-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function TestAllManagersPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error' | 'not-configured'>('checking');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [managers, setManagers] = useState({
    properties: { data: [] as any[], loading: false, initialized: false },
    destinations: { data: [] as any[], loading: false, initialized: false },
    bookings: { data: [] as any[], loading: false, initialized: false },
    callbacks: { data: [] as any[], loading: false, initialized: false },
    banners: { data: [] as any[], loading: false, initialized: false }
  });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setMessage('');

    try {
      if (!isSupabaseAvailable()) {
        setConnectionStatus('not-configured');
        setMessage('Supabase is not configured. Please check your .env.local file.');
        return;
      }

      const supabase = getSupabaseClient();
      
      // Test basic connection
      const { data, error } = await supabase
        .from('properties')
        .select('count')
        .limit(1);

      if (error) {
        setConnectionStatus('error');
        setMessage(`Connection error: ${error.message}`);
      } else {
        setConnectionStatus('connected');
        setMessage('✅ Supabase connection successful!');
        
        // Initialize all managers
        await initializeAllManagers();
      }
    } catch (error) {
      setConnectionStatus('error');
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const initializeAllManagers = async () => {
    try {
      // Initialize all managers
      await Promise.all([
        supabasePropertyManager.initialize(),
        supabaseDestinationManager.initialize(),
        supabaseBookingManager.initialize(),
        supabaseCallbackManager.initialize(),
        supabaseDealBannerManager.initialize()
      ]);

      // Load data from all managers
      setManagers({
        properties: {
          data: supabasePropertyManager.getProperties(),
          loading: supabasePropertyManager.isLoading(),
          initialized: supabasePropertyManager.isInitialized()
        },
        destinations: {
          data: supabaseDestinationManager.getAllDestinations(),
          loading: supabaseDestinationManager.isLoading(),
          initialized: supabaseDestinationManager.isInitialized()
        },
        bookings: {
          data: [],
          loading: false,
          initialized: supabaseBookingManager.initialized
        },
        callbacks: {
          data: supabaseCallbackManager.getAllCallbacks(),
          loading: supabaseCallbackManager.isLoading(),
          initialized: supabaseCallbackManager.isInitialized()
        },
        banners: {
          data: supabaseDealBannerManager.getAllBanners(),
          loading: supabaseDealBannerManager.isLoading(),
          initialized: supabaseDealBannerManager.isInitialized()
        }
      });

      setMessage('✅ All managers initialized successfully!');
    } catch (error) {
      setMessage(`Error initializing managers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const addTestData = async () => {
    setLoading(true);
    try {
      // Add test property
      const testProperty = await supabasePropertyManager.addProperty({
        name: `Test Property ${Date.now()}`,
        location: 'Test Location',
        description: 'This is a test property',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
        price: 15000,
        rating: 4.5,
        reviews: 10,
        type: 'Test Villa',
        amenities: ['WiFi', 'Kitchen', 'Parking'],
        featured: false
      });

      // Add test destination
      const testDestination = await supabaseDestinationManager.addDestination({
        name: `Test Destination ${Date.now()}`,
        location: 'Test Location',
        description: 'This is a test destination',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
        rating: 4.5,
        reviews: 10,
        highlights: ['Test Highlight'],
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80']
      });

      // Add test booking
      const testBooking = await supabaseBookingManager.createBooking({
        propertyId: testProperty.id,
        guestName: 'Test Guest',
        guestEmail: 'test@example.com',
        guestPhone: '+1234567890',
        propertyName: testProperty.name,
        checkIn: '2024-12-01',
        checkOut: '2024-12-03',
        guests: 2,
        amount: 30000,
        status: 'pending',
        paymentStatus: 'pending',
        specialRequests: 'Test special request'
      });

      // Add test callback
      const testCallback = await supabaseCallbackManager.submitCallback({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        message: 'This is a test callback request'
      });

      // Add test banner
      const testBanner = await supabaseDealBannerManager.addBanner({
        title: `Test Banner ${Date.now()}`,
        subtitle: 'Test subtitle',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
        link: '/test',
        active: true
      });

      setMessage('✅ Test data added to all managers!');
      await initializeAllManagers(); // Refresh data
    } catch (error) {
      setMessage(`Error adding test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      
      // Clear all tables
      await Promise.all([
        supabase.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('destinations').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('callback_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('deal_banners').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      ]);

      setMessage('✅ All data cleared!');
      await initializeAllManagers(); // Refresh data
    } catch (error) {
      setMessage(`Error clearing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'success';
      case 'error': return 'error';
      case 'not-configured': return 'warning';
      default: return 'info';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ color: '#704F49' }}>
        All Supabase Managers Test
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Connection Status
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: connectionStatus === 'connected' ? '#4caf50' : 
                                   connectionStatus === 'error' ? '#f44336' : '#ff9800'
                  }}
                />
              )}
              <Typography variant="body1">
                {connectionStatus === 'checking' && 'Checking connection...'}
                {connectionStatus === 'connected' && 'Connected to Supabase'}
                {connectionStatus === 'error' && 'Connection failed'}
                {connectionStatus === 'not-configured' && 'Not configured'}
              </Typography>
            </Box>

            {message && (
              <Alert severity={getStatusColor()} sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={testConnection}
                disabled={loading}
                sx={{ bgcolor: '#704F49', '&:hover': { bgcolor: '#5A3F3A' } }}
              >
                Test Connection
              </Button>
              
              <Button
                variant="outlined"
                onClick={addTestData}
                disabled={loading || connectionStatus !== 'connected'}
                sx={{ borderColor: '#704F49', color: '#704F49', '&:hover': { borderColor: '#5A3F3A' } }}
              >
                Add Test Data
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                onClick={clearAllData}
                disabled={loading || connectionStatus !== 'connected'}
              >
                Clear All Data
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {connectionStatus === 'connected' && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Manager Status
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {Object.entries(managers).map(([key, manager]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                      {key}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Data: {manager.data.length} items
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={manager.initialized ? 'Initialized' : 'Not Initialized'} 
                        size="small" 
                        color={manager.initialized ? 'success' : 'warning'}
                        sx={{ mr: 1 }}
                      />
                      {manager.loading && (
                        <CircularProgress size={16} />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="manager tabs">
              <Tab label="Properties" />
              <Tab label="Destinations" />
              <Tab label="Bookings" />
              <Tab label="Callbacks" />
              <Tab label="Banners" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>Properties ({managers.properties.data.length})</Typography>
            {managers.properties.data.map((property: any) => (
              <Accordion key={property.id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>{property.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography><strong>Location:</strong> {property.location}</Typography>
                  <Typography><strong>Price:</strong> ₹{property.price?.toLocaleString()}</Typography>
                  <Typography><strong>Type:</strong> {property.type}</Typography>
                  <Typography><strong>Rating:</strong> {property.rating}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>Destinations ({managers.destinations.data.length})</Typography>
            {managers.destinations.data.map((destination: any) => (
              <Accordion key={destination.id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>{destination.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography><strong>Location:</strong> {destination.location}</Typography>
                  <Typography><strong>Rating:</strong> {destination.rating}</Typography>
                  <Typography><strong>Highlights:</strong> {destination.highlights?.join(', ')}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>Bookings ({managers.bookings.data.length})</Typography>
            {managers.bookings.data.map((booking: any) => (
              <Accordion key={booking.id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>{booking.guest_name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography><strong>Email:</strong> {booking.guest_email}</Typography>
                  <Typography><strong>Status:</strong> {booking.status}</Typography>
                  <Typography><strong>Amount:</strong> ₹{booking.total_amount?.toLocaleString()}</Typography>
                  <Typography><strong>Dates:</strong> {booking.check_in_date} to {booking.check_out_date}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>Callbacks ({managers.callbacks.data.length})</Typography>
            {managers.callbacks.data.map((callback: any) => (
              <Accordion key={callback.id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>{callback.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography><strong>Email:</strong> {callback.email}</Typography>
                  <Typography><strong>Phone:</strong> {callback.phone}</Typography>
                  <Typography><strong>Status:</strong> {callback.status}</Typography>
                  <Typography><strong>Message:</strong> {callback.message}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom>Banners ({managers.banners.data.length})</Typography>
            {managers.banners.data.map((banner: any) => (
              <Accordion key={banner.id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>{banner.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography><strong>Subtitle:</strong> {banner.subtitle}</Typography>
                  <Typography><strong>Active:</strong> {banner.active ? 'Yes' : 'No'}</Typography>
                  <Typography><strong>Link:</strong> {banner.link}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </TabPanel>
        </Box>
      )}
    </Container>
  );
}
