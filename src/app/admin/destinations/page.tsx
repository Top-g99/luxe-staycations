'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Alert,
  Snackbar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

interface Destination {
  id: string;
  name: string;
  state: string;
  description: string;
  image_url: string;
  is_popular: boolean;
  created_at: string;
  updated_at: string;
}

const mockDestinations: Destination[] = [
  {
    id: '1',
    name: 'Lonavala',
    state: 'Maharashtra',
    description: 'Hill station known for its scenic beauty and pleasant weather',
    image_url: '/images/destinations/lonavala.jpg',
    is_popular: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Goa',
    state: 'Goa',
    description: 'Beach paradise with beautiful coastline and vibrant culture',
    image_url: '/images/destinations/goa.jpg',
    is_popular: true,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  },
  {
    id: '3',
    name: 'Kerala',
    state: 'Kerala',
    description: 'God\'s own country with backwaters and lush greenery',
    image_url: '/images/destinations/kerala.jpg',
    is_popular: true,
    created_at: '2024-01-25T10:00:00Z',
    updated_at: '2024-01-25T10:00:00Z'
  }
];

export default function DestinationsManagement() {
  const [destinations, setDestinations] = useState<Destination[]>(mockDestinations);
  const [open, setOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [formData, setFormData] = useState<Partial<Destination>>({
    name: '',
    state: '',
    description: '',
    image_url: '',
    is_popular: false
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleOpen = (destination?: Destination) => {
    if (destination) {
      setEditingDestination(destination);
      setFormData(destination);
    } else {
      setEditingDestination(null);
      setFormData({
        name: '',
        state: '',
        description: '',
        image_url: '',
        is_popular: false
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingDestination(null);
  };

  const handleSave = () => {
    if (editingDestination) {
      // Update existing destination
      setDestinations(prev => prev.map(d => 
        d.id === editingDestination.id 
          ? { ...formData, id: editingDestination.id, updated_at: new Date().toISOString() } as Destination 
          : d
      ));
      setSnackbar({ open: true, message: 'Destination updated successfully!', severity: 'success' });
    } else {
      // Add new destination
      const newDestination: Destination = {
        ...formData as Destination,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setDestinations(prev => [...prev, newDestination]);
      setSnackbar({ open: true, message: 'Destination added successfully!', severity: 'success' });
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    setDestinations(prev => prev.filter(d => d.id !== id));
    setSnackbar({ open: true, message: 'Destination deleted successfully!', severity: 'success' });
  };

  const handleTogglePopular = (id: string) => {
    setDestinations(prev => prev.map(d => 
      d.id === id ? { ...d, is_popular: !d.is_popular, updated_at: new Date().toISOString() } : d
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Destination Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Manage destinations, add new locations, and update existing ones
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ mb: 2 }}
        >
          Add New Destination
        </Button>
      </Box>

      {/* Destinations Grid */}
      <Grid container spacing={3}>
        {destinations.map((destination) => (
          <Grid item xs={12} md={6} lg={4} key={destination.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {destination.name}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpen(destination)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(destination.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">{destination.state}</Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {destination.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    icon={<StarIcon />}
                    label={destination.is_popular ? 'Popular' : 'Regular'}
                    color={destination.is_popular ? 'warning' : 'default'}
                    size="small"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={destination.is_popular}
                        onChange={() => handleTogglePopular(destination.id)}
                        size="small"
                      />
                    }
                    label=""
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Destination Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDestination ? 'Edit Destination' : 'Add New Destination'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Destination Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_popular || false}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                  />
                }
                label="Popular Destination"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingDestination ? 'Update' : 'Add'} Destination
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
