'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Download,
  Upload,
  Refresh,
  Storage,
  Cloud,
  CheckCircle,
  Error,
  Warning,
  Visibility,
  VisibilityOff,
  Backup,
  Restore,
  Analytics,
  Settings,
  Sync,
  Clear,
  Search,
  FilterList
} from '@mui/icons-material';
import {
  masterDataManager,
  propertyManager,
  destinationManager,
  bookingManager,
  callbackManager,
  dealBannerManager,
  heroBackgroundManager,
  settingsManager,
  userManager,
  profileManager,
  reviewManager,
  paymentManager,
  loyaltyManager,
  couponManager,
  specialRequestManager
} from '@/lib/dataManager';
import { isAdmin, hasAdminPermission, getAdminPermissionError } from '@/lib/adminPermissions';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDataMonitorPage() {
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [stats, setStats] = useState<any>({
    bookings: { total: 0, active: 0, featured: 0 },
    users: { total: 0, active: 0, featured: 0 },
    destinations: { total: 0, active: 0, featured: 0 },
    properties: { total: 0, active: 0, featured: 0 },
    partners: { total: 0, active: 0, featured: 0 },
    callback_requests: { total: 0, active: 0, featured: 0 },
    deal_banners: { total: 0, active: 0, featured: 0 },
    hero_backgrounds: { total: 0, active: 0, featured: 0 },
    settings: { total: 0, active: 0, featured: 0 },
    profiles: { total: 0, active: 0, featured: 0 },
    reviews: { total: 0, active: 0, featured: 0 },
    payments: { total: 0, active: 0, featured: 0 },
    loyalty_transactions: { total: 0, active: 0, featured: 0 },
    coupons: { total: 0, active: 0, featured: 0 },
    special_requests: { total: 0, active: 0, featured: 0 }
  });
  const [syncStatus, setSyncStatus] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showInactive, setShowInactive] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [liveData, setLiveData] = useState<Record<string, any[]>>({});

  const managers = [
    { name: 'Properties', manager: propertyManager, type: 'properties', icon: '🏠' },
    { name: 'Destinations', manager: destinationManager, type: 'destinations', icon: '🌍' },
    { name: 'Bookings', manager: bookingManager, type: 'bookings', icon: '📅' },
    { name: 'Callbacks', manager: callbackManager, type: 'callback_requests', icon: '📞' },
    { name: 'Banners', manager: dealBannerManager, type: 'deal_banners', icon: '🎯' },
    { name: 'Hero Backgrounds', manager: heroBackgroundManager, type: 'hero_backgrounds', icon: '🖼️' },
    { name: 'Users', manager: userManager, type: 'users', icon: '👥' },
    { name: 'Profiles', manager: profileManager, type: 'profiles', icon: '👤' },
    { name: 'Reviews', manager: reviewManager, type: 'reviews', icon: '⭐' },
    { name: 'Payments', manager: paymentManager, type: 'payments', icon: '💳' },
    { name: 'Loyalty', manager: loyaltyManager, type: 'loyalty_transactions', icon: '🎁' },
    { name: 'Coupons', manager: couponManager, type: 'coupons', icon: '🎫' },
    { name: 'Requests', manager: specialRequestManager, type: 'special_requests', icon: '📝' },
    { name: 'Settings', manager: settingsManager, type: 'settings', icon: '⚙️' }
  ];

  useEffect(() => {
    initializeData();
    
    // Listen for data update events from other pages
    const handleDataUpdate = (event: CustomEvent) => {
      console.log('Data update event received:', event.detail);
      fetchLiveData();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('dataUpdated', handleDataUpdate as EventListener);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('dataUpdated', handleDataUpdate as EventListener);
      }
    };
  }, []);

  const initializeData = async () => {
    setIsLoading(true);
    try {
      // Initialize local managers
      await masterDataManager.initializeAll();
      
      // Fetch live data from APIs
      await fetchLiveData();
      
      setConnectionStatus('connected');
      // Don't call updateStats() here as it will override live data stats
      // updateStats() is already called in fetchLiveData()
      updateSyncStatus();
      setAlert({
        type: 'success',
        message: 'All data managers initialized and live data synced!'
      });
    } catch (error) {
      console.error('Error initializing data:', error);
      setConnectionStatus('error');
      setAlert({
        type: 'error',
        message: 'Failed to initialize data managers or fetch live data'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLiveData = async () => {
    try {
      console.log('Fetching live data from APIs...');
      
      // First test the data endpoints
      const testResponse = await fetch('/api/test-data');
      const testData = await testResponse.json();
      console.log('Test data response:', testData);
      
      const dataPromises = [
        // Fetch bookings from Supabase
        fetch('/api/bookings').then(res => res.json()).then(data => {
          console.log('Bookings API response:', data);
          return data.success ? data.data : [];
        }).catch(error => {
          console.error('Bookings API error:', error);
          return [];
        }),
        // Fetch analytics data
        fetch('/api/analytics').then(res => res.json()).then(data => {
          console.log('Analytics API response:', data);
          return data.success ? data.data : {};
        }).catch(error => {
          console.error('Analytics API error:', error);
          return {};
        }),
        // Fetch users
        fetch('/api/users').then(res => res.json()).then(data => {
          console.log('Users API response:', data);
          return data.success ? data.data : [];
        }).catch(error => {
          console.error('Users API error:', error);
          return [];
        }),
        // Fetch destinations
        fetch('/api/destinations').then(res => res.json()).then(data => {
          console.log('Destinations API response:', data);
          return data.success ? data.data : [];
        }).catch(error => {
          console.error('Destinations API error:', error);
          return [];
        }),
        // Fetch properties/villas
        fetch('/api/villas').then(res => res.json()).then(data => {
          console.log('Properties API response:', data);
          return data.success ? data.data : [];
        }).catch(error => {
          console.error('Properties API error:', error);
          return [];
        }),
        // Fetch partners
        fetch('/api/partners').then(res => res.json()).then(data => {
          console.log('Partners API response:', data);
          return data.success ? data.data : [];
        }).catch(error => {
          console.error('Partners API error:', error);
          return [];
        }),
        // Fetch callback requests
        fetch('/api/contact').then(res => res.json()).then(data => {
          console.log('Contact/Callback API response:', data);
          return data.success ? data.data : [];
        }).catch(error => {
          console.error('Contact/Callback API error:', error);
          return [];
        }),
        // Fetch special requests
        fetch('/api/consultations').then(res => res.json()).then(data => {
          console.log('Consultations API response:', data);
          return data.success ? data.data : [];
        }).catch(error => {
          console.error('Consultations API error:', error);
          return [];
        }),
        // Fetch deal banners
        fetch('/api/deal-banner').then(res => res.json()).then(data => {
          console.log('Deal Banner API response:', data);
          return data.success ? data.data : [];
        }).catch(error => {
          console.error('Deal Banner API error:', error);
          return [];
        }),
        // Fetch payments
        fetch('/api/payments').then(res => res.json()).then(data => {
          console.log('Payments API response:', data);
          return data.success ? data.data : [];
        }).catch(error => {
          console.error('Payments API error:', error);
          return [];
        }),
        // Fetch loyalty transactions
        fetch('/api/loyalty/redemption-requests').then(res => res.json()).then(data => {
          console.log('Loyalty API response:', data);
          return data.success ? data.data : [];
        }).catch(error => {
          console.error('Loyalty API error:', error);
          return [];
        })
      ];

      const [bookings, analytics, users, destinations, properties, partners, callbacks, consultations, dealBanners, payments, loyalty] = await Promise.all(dataPromises);

      console.log('Live data fetched:', {
        bookings: bookings?.length || 0,
        users: users?.length || 0,
        destinations: destinations?.length || 0,
        properties: properties?.length || 0,
        partners: partners?.length || 0,
        callbacks: callbacks?.length || 0,
        consultations: consultations?.length || 0,
        dealBanners: dealBanners?.length || 0,
        payments: payments?.length || 0,
        loyalty: loyalty?.length || 0,
        analytics: analytics
      });

      setLiveData({
        bookings: bookings || [],
        analytics: analytics || {},
        users: users || [],
        destinations: destinations || [],
        properties: properties || [],
        partners: partners || [],
        callback_requests: callbacks || [],
        special_requests: consultations || [],
        deal_banners: dealBanners || [],
        payments: payments || [],
        loyalty_transactions: loyalty || []
      });

      // Update stats with live data in the expected format
      const totalBookings = bookings?.length || 0;
      const totalUsers = users?.length || 0;
      const totalDestinations = destinations?.length || 0;
      const totalProperties = properties?.length || 0;
      const totalPartners = partners?.length || 0;
      const totalCallbacks = callbacks?.length || 0;
      const totalConsultations = consultations?.length || 0;
      const totalDealBanners = dealBanners?.length || 0;
      const totalPayments = payments?.length || 0;
      const totalLoyalty = loyalty?.length || 0;
      
      setStats({
        bookings: {
          total: totalBookings,
          active: totalBookings,
          featured: analytics?.confirmedBookings || 0
        },
        users: {
          total: totalUsers,
          active: totalUsers,
          featured: 0
        },
        destinations: {
          total: totalDestinations,
          active: totalDestinations,
          featured: destinations?.filter((d: any) => d.featured)?.length || 0
        },
        properties: {
          total: totalProperties,
          active: totalProperties,
          featured: properties?.filter((p: any) => p.featured)?.length || 0
        },
        partners: {
          total: totalPartners,
          active: totalPartners,
          featured: 0
        },
        callback_requests: {
          total: totalCallbacks,
          active: totalCallbacks,
          featured: 0
        },
        deal_banners: {
          total: totalDealBanners,
          active: totalDealBanners,
          featured: 0
        },
        hero_backgrounds: {
          total: 0,
          active: 0,
          featured: 0
        },
        settings: {
          total: 0,
          active: 0,
          featured: 0
        },
        profiles: {
          total: 0,
          active: 0,
          featured: 0
        },
        reviews: {
          total: 0,
          active: 0,
          featured: 0
        },
        payments: {
          total: totalPayments,
          active: totalPayments,
          featured: 0
        },
        loyalty_transactions: {
          total: totalLoyalty,
          active: totalLoyalty,
          featured: 0
        },
        coupons: {
          total: 0,
          active: 0,
          featured: 0
        },
        special_requests: {
          total: totalConsultations,
          active: totalConsultations,
          featured: 0
        }
      });

      console.log('Live data and stats updated successfully');
      console.log('Final stats object:', stats);

    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  };

  const updateStats = () => {
    // Only update stats if we don't have live data
    if (Object.keys(liveData).length === 0) {
      const newStats = masterDataManager.getStats();
      setStats(newStats);
    }
    // Live data stats are already set in fetchLiveData()
  };

  const updateSyncStatus = () => {
    const status: Record<string, boolean> = {};
    managers.forEach(({ type, manager }) => {
      // Use live data if available, otherwise fall back to local manager
      if (liveData[type] && liveData[type].length > 0) {
        status[type] = true;
      } else {
        status[type] = manager.getAll().length > 0;
      }
    });
    setSyncStatus(status);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBackup = async () => {
    try {
      const data = await masterDataManager.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `luxe_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setAlert({ type: 'success', message: 'Backup created successfully!' });
      setBackupDialogOpen(false);
    } catch (error) {
      setAlert({ type: 'error', message: 'Error creating backup' });
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          await masterDataManager.importAllData(data);
          updateStats();
          updateSyncStatus();
          setAlert({ type: 'success', message: 'Data restored successfully!' });
          setRestoreDialogOpen(false);
        } catch (error) {
          setAlert({ type: 'error', message: 'Error restoring data' });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        managers.forEach(({ manager }) => manager.clear());
        updateStats();
        updateSyncStatus();
        setAlert({ type: 'success', message: 'All data cleared successfully!' });
      } catch (error) {
        setAlert({ type: 'error', message: 'Error clearing data' });
      }
    }
  };

  const handleSyncAll = async () => {
    try {
      setAlert({ type: 'info', message: 'Synchronizing data...' });
      await masterDataManager.initializeAll();
      await fetchLiveData(); // Also refresh live data
      // Don't call updateStats() here as it will override live data stats
      updateSyncStatus();
      setAlert({ type: 'success', message: 'All data synchronized successfully!' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Error synchronizing data' });
    }
  };

  const handleRefreshLiveData = async () => {
    try {
      setAlert({ type: 'info', message: 'Refreshing live data...' });
      await fetchLiveData();
      setAlert({ type: 'success', message: 'Live data refreshed successfully!' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Error refreshing live data' });
    }
  };

  const handleDeleteItem = async (item: any, type: string) => {
    if (!hasAdminPermission('delete', type)) {
      setAlert({
        type: 'error',
        message: getAdminPermissionError('delete', type)
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete from local manager
      const currentManager = managers.find(m => m.type === type)?.manager;
      if (currentManager && typeof currentManager.delete === 'function') {
        currentManager.delete(item.id);
      }

      // Delete from live data if it exists
      if (liveData[type]) {
        setLiveData(prev => ({
          ...prev,
          [type]: prev[type].filter((i: any) => i.id !== item.id)
        }));
      }

      // Refresh live data to reflect the deletion
      await fetchLiveData();
      
      // Update stats
      updateStats();
      updateSyncStatus();

      setAlert({ type: 'success', message: `${type} deleted successfully!` });
    } catch (error) {
      setAlert({ type: 'error', message: `Error deleting ${type}` });
    }
  };

  const getFilteredData = () => {
    const currentType = managers[tabValue].type;
    let data: any[] = [];

    // Use live data if available, otherwise fall back to local manager
    if (liveData[currentType] && liveData[currentType].length > 0) {
      data = liveData[currentType];
    } else {
      const currentManager = managers[tabValue].manager;
      data = currentManager.getAll();
    }

    // Apply search filter
    if (searchQuery) {
      const searchableFields = getSearchableFields(currentType);
      data = data.filter(item => {
        return searchableFields.some(field => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(searchQuery.toLowerCase());
        });
      });
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      data = data.filter(item => (item as any).status === filterStatus);
    }

    // Apply active/inactive filter
    if (!showInactive) {
      data = data.filter(item => (item as any).active !== false);
    }

    return data;
  };

  const getSearchableFields = (type: string): any[] => {
    switch (type) {
      case 'properties':
        return ['name', 'location', 'description'];
      case 'destinations':
        return ['name', 'location', 'description'];
      case 'bookings':
        return ['guestName', 'guestEmail', 'guestPhone'];
      case 'callback_requests':
        return ['name', 'email', 'phone', 'message'];
      case 'hero_backgrounds':
        return ['title', 'subtitle', 'alt_text'];
      case 'users':
        return ['name', 'email'];
      default:
        return ['name', 'description'];
    }
  };

  const getStatusOptions = () => {
    const currentManager = managers[tabValue].manager;
    const data = currentManager.getAll();
    const statuses = [...new Set(data.map(item => (item as any).status).filter(Boolean))];
    return statuses;
  };

  const renderDataTable = () => {
    const data = getFilteredData();
    const currentType = managers[tabValue].type;

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              {currentType === 'properties' && (
                <>
                  <TableCell>Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Status</TableCell>
                </>
              )}
              {currentType === 'destinations' && (
                <>
                  <TableCell>Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Featured</TableCell>
                </>
              )}
              {currentType === 'bookings' && (
                <>
                  <TableCell>Guest</TableCell>
                  <TableCell>Property</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount</TableCell>
                </>
              )}
              {currentType === 'callback_requests' && (
                <>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                </>
              )}
                             {currentType === 'users' && (
                 <>
                   <TableCell>Name</TableCell>
                   <TableCell>Email</TableCell>
                   <TableCell>Role</TableCell>
                 </>
               )}
               {currentType === 'hero_backgrounds' && (
                 <>
                   <TableCell>Title</TableCell>
                   <TableCell>Subtitle</TableCell>
                   <TableCell>Priority</TableCell>
                   <TableCell>Status</TableCell>
                 </>
               )}
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell>{item.id.substring(0, 8)}...</TableCell>
                {currentType === 'properties' && (
                  <>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>₹{item.price?.toLocaleString()}</TableCell>
                    <TableCell>{item.rating} ⭐</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.featured ? 'Featured' : 'Regular'} 
                        size="small" 
                        color={item.featured ? 'primary' : 'default'}
                      />
                    </TableCell>
                  </>
                )}
                {currentType === 'destinations' && (
                  <>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.featured ? 'Featured' : 'Regular'} 
                        size="small" 
                        color={item.featured ? 'primary' : 'default'}
                      />
                    </TableCell>
                  </>
                )}
                {currentType === 'bookings' && (
                  <>
                    <TableCell>{item.guestName}</TableCell>
                    <TableCell>{item.propertyId}</TableCell>
                    <TableCell>{item.checkIn} - {item.checkOut}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.status} 
                        size="small" 
                        color={
                          item.status === 'confirmed' ? 'success' : 
                          item.status === 'cancelled' ? 'error' : 
                          item.status === 'completed' ? 'primary' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>₹{item.totalAmount?.toLocaleString()}</TableCell>
                  </>
                )}
                {currentType === 'callback_requests' && (
                  <>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.phone}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.status} 
                        size="small" 
                        color={
                          item.status === 'resolved' ? 'success' : 
                          item.status === 'contacted' ? 'primary' : 'default'
                        }
                      />
                    </TableCell>
                  </>
                )}
                                 {currentType === 'users' && (
                   <>
                     <TableCell>{item.name}</TableCell>
                     <TableCell>{item.email}</TableCell>
                     <TableCell>
                       <Chip 
                         label={item.role} 
                         size="small" 
                         color={item.role === 'admin' ? 'error' : 'default'}
                       />
                     </TableCell>
                   </>
                 )}
                 {currentType === 'hero_backgrounds' && (
                   <>
                     <TableCell>{item.title}</TableCell>
                     <TableCell>{item.subtitle || '-'}</TableCell>
                     <TableCell>
                       <Chip 
                         label={`Priority ${item.priority}`} 
                         size="small" 
                         color={item.priority === 1 ? 'primary' : 'default'}
                       />
                     </TableCell>
                     <TableCell>
                       <Chip 
                         label={item.active ? 'Active' : 'Inactive'} 
                         size="small" 
                         color={item.active ? 'success' : 'default'}
                       />
                     </TableCell>
                   </>
                 )}
                <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  {isAdmin() && (
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteItem(item, currentType)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Data Monitor & Management
      </Typography>

      {/* Connection Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {connectionStatus === 'connected' ? (
                <CheckCircle color="success" />
              ) : connectionStatus === 'error' ? (
                <Error color="error" />
              ) : (
                <Warning color="warning" />
              )}
              <Typography variant="h6">
                Connection Status: {connectionStatus === 'connected' ? 'Connected' : 
                                  connectionStatus === 'error' ? 'Error' : 'Checking...'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<Sync />}
                onClick={handleSyncAll}
                disabled={isLoading}
              >
                Sync All
              </Button>
              <Button
                startIcon={<Refresh />}
                onClick={handleRefreshLiveData}
                disabled={isLoading}
                variant="outlined"
              >
                Refresh Live Data
              </Button>
              <Button
                startIcon={<Backup />}
                onClick={() => setBackupDialogOpen(true)}
                variant="outlined"
              >
                Backup
              </Button>
              <Button
                startIcon={<Restore />}
                onClick={() => setRestoreDialogOpen(true)}
                variant="outlined"
              >
                Restore
              </Button>
              <Button
                startIcon={<Clear />}
                onClick={handleClearAll}
                variant="outlined"
                color="error"
              >
                Clear All
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Data Statistics Overview
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(stats).map(([tableName, stat]: [string, any]) => (
              <Grid item xs={12} sm={6} md={3} key={tableName}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6">
                        {managers.find(m => m.type === tableName)?.icon || '📊'}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        {tableName}
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {stat.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.active} active • {stat.featured} featured
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stat.active / Math.max(stat.total, 1)) * 100} 
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Alert */}
      {alert && (
        <Alert 
          severity={alert.type} 
          sx={{ mb: 3 }}
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      {/* Sync Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sync Status
          </Typography>
          <Grid container spacing={2}>
            {managers.map(({ name, type, icon }) => (
              <Grid item xs={12} sm={6} md={3} key={type}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6">{icon}</Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">{name}</Typography>
                    <Chip 
                      label={syncStatus[type] ? 'Synced' : 'Empty'} 
                      size="small" 
                      color={syncStatus[type] ? 'success' : 'default'}
                    />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Data Management Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            {managers.map((manager, index) => (
              <Tab 
                key={index} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{manager.icon}</Typography>
                    <Typography>{manager.name}</Typography>
                    <Chip 
                      label={stats[manager.type]?.total || 0} 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  </Box>
                } 
              />
            ))}
          </Tabs>
        </Box>

        {managers.map((manager, index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ minWidth: 200 }}
              />
              
              {getStatusOptions().length > 0 && (
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All</MenuItem>
                    {getStatusOptions().map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              <FormControlLabel
                control={
                  <Switch
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                  />
                }
                label="Show Inactive"
              />
              
              <Button
                startIcon={<Refresh />}
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setShowInactive(false);
                }}
              >
                Clear Filters
              </Button>
            </Box>

            {/* Data Table */}
            {renderDataTable()}

            {/* Empty State */}
            {getFilteredData().length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No {manager.name.toLowerCase()} found
                </Typography>
              </Box>
            )}
          </TabPanel>
        ))}
      </Card>

      {/* Backup Dialog */}
      <Dialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)}>
        <DialogTitle>Create Backup</DialogTitle>
        <DialogContent>
          <Typography>
            This will create a backup of all your data. The backup will be downloaded as a JSON file.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBackup} variant="contained">
            Create Backup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)}>
        <DialogTitle>Restore Data</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            This will restore data from a backup file. This action will replace all existing data.
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<Upload />}
            fullWidth
          >
            Choose Backup File
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleRestore}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
