'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
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
  Divider
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
  Warning
} from '@mui/icons-material';
import {
  masterDataManager,
  propertyManager,
  destinationManager,
  bookingManager,
  callbackManager,
  dealBannerManager,
  Property,
  Destination,
  Booking,
  CallbackRequest,
  DealBanner
} from '@/lib/dataManager';

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
      id={`data-tabpanel-${index}`}
      aria-labelledby={`data-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function TestDataManagerPage() {
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [stats, setStats] = useState<any>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentManager, setCurrentManager] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const managers = [
    { name: 'Properties', manager: propertyManager, type: 'properties' },
    { name: 'Destinations', manager: destinationManager, type: 'destinations' },
    { name: 'Bookings', manager: bookingManager, type: 'bookings' },
    { name: 'Callbacks', manager: callbackManager, type: 'callback_requests' },
    { name: 'Banners', manager: dealBannerManager, type: 'deal_banners' }
  ];

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setIsLoading(true);
    try {
      await masterDataManager.initializeAll();
      setConnectionStatus('connected');
      updateStats();
    } catch (error) {
      console.error('Error initializing data:', error);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = () => {
    const newStats = masterDataManager.getStats();
    setStats(newStats);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setCurrentManager(managers[newValue].manager);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({});
    setDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (currentManager) {
      try {
        await currentManager.delete(id);
        updateStats();
        setAlert({ type: 'success', message: 'Item deleted successfully!' });
      } catch (error) {
        setAlert({ type: 'error', message: 'Error deleting item' });
      }
    }
  };

  const handleSave = async () => {
    if (!currentManager) return;

    try {
      if (editingItem) {
        await currentManager.update(editingItem.id, formData);
        setAlert({ type: 'success', message: 'Item updated successfully!' });
      } else {
        await currentManager.create(formData);
        setAlert({ type: 'success', message: 'Item created successfully!' });
      }
      setDialogOpen(false);
      updateStats();
    } catch (error) {
      setAlert({ type: 'error', message: 'Error saving item' });
    }
  };

  const handleExport = () => {
    const data = currentManager?.exportData();
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${managers[tabValue].type}_data.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentManager) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const success = currentManager.importData(content);
        if (success) {
          updateStats();
          setAlert({ type: 'success', message: 'Data imported successfully!' });
        } else {
          setAlert({ type: 'error', message: 'Error importing data' });
        }
      };
      reader.readAsText(file);
    }
  };

  const renderForm = () => {
    const managerType = managers[tabValue].type;
    
    switch (managerType) {
      case 'properties':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Guests"
                type="number"
                value={formData.maxGuests || ''}
                onChange={(e) => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Rating"
                type="number"
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                value={formData.rating || ''}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reviews"
                type="number"
                value={formData.reviews || ''}
                onChange={(e) => setFormData({ ...formData, reviews: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amenities (comma-separated)"
                value={formData.amenities?.join(', ') || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  amenities: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
              />
            </Grid>
          </Grid>
        );

      case 'destinations':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Attractions (comma-separated)"
                value={formData.attractions?.join(', ') || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  attractions: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
              />
            </Grid>
          </Grid>
        );

      case 'bookings':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Guest Name"
                value={formData.guestName || ''}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Guest Email"
                type="email"
                value={formData.guestEmail || ''}
                onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Guest Phone"
                value={formData.guestPhone || ''}
                onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Property ID"
                value={formData.propertyId || ''}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Check In"
                type="date"
                value={formData.checkIn || ''}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Check Out"
                type="date"
                value={formData.checkOut || ''}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Guests"
                type="number"
                value={formData.guests || ''}
                onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Amount"
                type="number"
                value={formData.totalAmount || ''}
                onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Status"
                select
                value={formData.status || 'pending'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </TextField>
            </Grid>
          </Grid>
        );

      default:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        );
    }
  };

  const renderItem = (item: any) => {
    const managerType = managers[tabValue].type;
    
    switch (managerType) {
      case 'properties':
        return (
          <ListItem>
            <ListItemText
              primary={item.name}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.location} • ₹{item.price}/night • {item.maxGuests} guests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rating: {item.rating} ({item.reviews} reviews)
                  </Typography>
                  {item.amenities && (
                    <Box sx={{ mt: 1 }}>
                      {item.amenities.slice(0, 3).map((amenity: string, index: number) => (
                        <Chip key={index} label={amenity} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                      {item.amenities.length > 3 && (
                        <Chip label={`+${item.amenities.length - 3} more`} size="small" />
                      )}
                    </Box>
                  )}
                </Box>
              }
            />
            <Box>
              <IconButton onClick={() => handleEdit(item)}>
                <Edit />
              </IconButton>
              <IconButton onClick={() => handleDelete(item.id)} color="error">
                <Delete />
              </IconButton>
            </Box>
          </ListItem>
        );

      case 'destinations':
        return (
          <ListItem>
            <ListItemText
              primary={item.name}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  {item.attractions && (
                    <Box sx={{ mt: 1 }}>
                      {item.attractions.slice(0, 3).map((attraction: string, index: number) => (
                        <Chip key={index} label={attraction} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                      {item.attractions.length > 3 && (
                        <Chip label={`+${item.attractions.length - 3} more`} size="small" />
                      )}
                    </Box>
                  )}
                </Box>
              }
            />
            <Box>
              <IconButton onClick={() => handleEdit(item)}>
                <Edit />
              </IconButton>
              <IconButton onClick={() => handleDelete(item.id)} color="error">
                <Delete />
              </IconButton>
            </Box>
          </ListItem>
        );

      case 'bookings':
        return (
          <ListItem>
            <ListItemText
              primary={item.guestName}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.guestEmail} • {item.guestPhone}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.checkIn} to {item.checkOut} • {item.guests} guests
                  </Typography>
                  <Chip 
                    label={item.status} 
                    size="small" 
                    color={
                      item.status === 'confirmed' ? 'success' : 
                      item.status === 'cancelled' ? 'error' : 
                      item.status === 'completed' ? 'primary' : 'default'
                    }
                  />
                </Box>
              }
            />
            <Box>
              <IconButton onClick={() => handleEdit(item)}>
                <Edit />
              </IconButton>
              <IconButton onClick={() => handleDelete(item.id)} color="error">
                <Delete />
              </IconButton>
            </Box>
          </ListItem>
        );

      default:
        return (
          <ListItem>
            <ListItemText
              primary={item.name || item.title}
              secondary={item.description || item.message}
            />
            <Box>
              <IconButton onClick={() => handleEdit(item)}>
                <Edit />
              </IconButton>
              <IconButton onClick={() => handleDelete(item.id)} color="error">
                <Delete />
              </IconButton>
            </Box>
          </ListItem>
        );
    }
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
        Data Manager Test
      </Typography>

      {/* Connection Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
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
            <Button
              startIcon={<Refresh />}
              onClick={initializeData}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Data Statistics
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(stats).map(([tableName, stat]: [string, any]) => (
              <Grid item xs={12} sm={6} md={3} key={tableName}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      {tableName}
                    </Typography>
                    <Typography variant="h6">
                      {stat.total} total
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.active} active, {stat.featured} featured
                    </Typography>
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

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            {managers.map((manager, index) => (
              <Tab key={index} label={manager.name} />
            ))}
          </Tabs>
        </Box>

        {managers.map((manager, index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                {manager.name} ({currentManager?.getAll().length || 0})
              </Typography>
              <Box>
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  onClick={handleAdd}
                  sx={{ mr: 1 }}
                >
                  Add {manager.name.slice(0, -1)}
                </Button>
                <Tooltip title="Export Data">
                  <IconButton onClick={handleExport}>
                    <Download />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Import Data">
                  <IconButton component="label">
                    <Upload />
                    <input
                      type="file"
                      accept=".json"
                      style={{ display: 'none' }}
                      onChange={handleImport}
                    />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <List>
              {currentManager?.getAll().map((item: any) => (
                <React.Fragment key={item.id}>
                  {renderItem(item)}
                  <Divider />
                </React.Fragment>
              ))}
            </List>

            {(!currentManager || currentManager.getAll().length === 0) && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No {manager.name.toLowerCase()} found
                </Typography>
              </Box>
            )}
          </TabPanel>
        ))}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit' : 'Add'} {managers[tabValue].name.slice(0, -1)}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {renderForm()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
