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
  LocalOffer as OfferIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const mockOffers: Offer[] = [
  {
    id: '1',
    title: 'Early Bird Special',
    description: 'Book 30 days in advance and get 20% off on all properties',
    discount_percentage: 20,
    valid_from: '2024-01-01',
    valid_until: '2024-12-31',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Weekend Getaway',
    description: 'Special weekend rates for 2-night stays',
    discount_percentage: 15,
    valid_from: '2024-02-01',
    valid_until: '2024-06-30',
    is_active: true,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  },
  {
    id: '3',
    title: 'Long Stay Discount',
    description: 'Stay for 7+ nights and get 25% off',
    discount_percentage: 25,
    valid_from: '2024-03-01',
    valid_until: '2024-08-31',
    is_active: false,
    created_at: '2024-01-25T10:00:00Z',
    updated_at: '2024-01-25T10:00:00Z'
  }
];

export default function OffersManagement() {
  const [offers, setOffers] = useState<Offer[]>(mockOffers);
  const [open, setOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState<Partial<Offer>>({
    title: '',
    description: '',
    discount_percentage: 0,
    valid_from: '',
    valid_until: '',
    is_active: true
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleOpen = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData(offer);
    } else {
      setEditingOffer(null);
      setFormData({
        title: '',
        description: '',
        discount_percentage: 0,
        valid_from: '',
        valid_until: '',
        is_active: true
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingOffer(null);
  };

  const handleSave = () => {
    if (editingOffer) {
      // Update existing offer
      setOffers(prev => prev.map(o => 
        o.id === editingOffer.id 
          ? { ...formData, id: editingOffer.id, updated_at: new Date().toISOString() } as Offer 
          : o
      ));
      setSnackbar({ open: true, message: 'Offer updated successfully!', severity: 'success' });
    } else {
      // Add new offer
      const newOffer: Offer = {
        ...formData as Offer,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setOffers(prev => [...prev, newOffer]);
      setSnackbar({ open: true, message: 'Offer added successfully!', severity: 'success' });
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    setOffers(prev => prev.filter(o => o.id !== id));
    setSnackbar({ open: true, message: 'Offer deleted successfully!', severity: 'success' });
  };

  const handleToggleActive = (id: string) => {
    setOffers(prev => prev.map(o => 
      o.id === id ? { ...o, is_active: !o.is_active, updated_at: new Date().toISOString() } : o
    ));
  };

  const isOfferValid = (offer: Offer) => {
    const now = new Date();
    const validFrom = new Date(offer.valid_from);
    const validUntil = new Date(offer.valid_until);
    return now >= validFrom && now <= validUntil;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Offers & Deals Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Manage special offers, discounts, and promotional deals
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ mb: 2 }}
        >
          Add New Offer
        </Button>
      </Box>

      {/* Offers Grid */}
      <Grid container spacing={3}>
        {offers.map((offer) => (
          <Grid item xs={12} md={6} lg={4} key={offer.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {offer.title}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpen(offer)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(offer.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {offer.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MoneyIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="primary">
                    {offer.discount_percentage}% OFF
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {new Date(offer.valid_from).toLocaleDateString()} - {new Date(offer.valid_until).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={isOfferValid(offer) ? 'Valid' : 'Expired'}
                    color={isOfferValid(offer) ? 'success' : 'default'}
                    size="small"
                  />
                  <Chip
                    label={offer.is_active ? 'Active' : 'Inactive'}
                    color={offer.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={offer.is_active}
                        onChange={() => handleToggleActive(offer.id)}
                        size="small"
                      />
                    }
                    label="Active"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Offer Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingOffer ? 'Edit Offer' : 'Add New Offer'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Offer Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Discount Percentage"
                type="number"
                value={formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Valid From"
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Valid Until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active || false}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Active Offer"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingOffer ? 'Update' : 'Add'} Offer
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
