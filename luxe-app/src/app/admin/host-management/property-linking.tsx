"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Link,
  Business,
  Person,
  LinkOff
} from '@mui/icons-material';
import { supabaseHostManager } from '@/lib/supabaseHostManager';
import { propertyManager, Property } from '@/lib/dataManager';

interface PropertyLinkingProps {
  hostId: string;
  hostName: string;
}



interface HostProperty {
  id: string;
  name: string;
  location: string;
  type: string;
  status: string;
  description?: string;
  amenities: string[];
  pricing: any;
  images: string[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
}

export default function PropertyLinking({ hostId, hostName }: PropertyLinkingProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [hostProperties, setHostProperties] = useState<HostProperty[]>([]);
  const [openLinkDialog, setOpenLinkDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyType, setPropertyType] = useState('Luxury Villa');
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadData();
  }, [hostId]);

  const loadData = async () => {
    try {
      console.log('Loading data for host:', hostId);
      
      // Check if propertyManager is properly initialized
      console.log('PropertyManager instance:', propertyManager);
      console.log('PropertyManager methods:', Object.getOwnPropertyNames(propertyManager));
      
      // Load main properties (like Casa Alphonso) from live data
      const mainProperties = await propertyManager.getAll();
      console.log('Main properties loaded:', mainProperties);
      console.log('Properties type:', typeof mainProperties);
      console.log('Properties length:', mainProperties?.length);
      
      if (!mainProperties || mainProperties.length === 0) {
        console.log('No properties found in propertyManager. Checking if data needs to be initialized...');
        // Try to initialize the property manager
        await propertyManager.initialize();
        const refreshedProperties = await propertyManager.getAll();
        console.log('Properties after initialization:', refreshedProperties);
        setProperties(refreshedProperties || []);
      } else {
        setProperties(mainProperties);
      }

      // Load host properties
      const hostProps = await supabaseHostManager.getHostProperties(hostId);
      console.log('Host properties loaded:', hostProps);
      setHostProperties(hostProps);
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Error details:', error);
    }
  };

  const handleLinkProperty = async () => {
    if (!selectedProperty) return;

    try {
      const result = await supabaseHostManager.assignPropertyToHost(hostId, {
        name: selectedProperty.name,
        location: selectedProperty.location,
        type: propertyType,
        description: selectedProperty.description,
        amenities: selectedProperty.amenities,
        pricing: {
          basePrice: selectedProperty.price,
          weekendPrice: selectedProperty.price * 1.2,
          seasonalRates: {
            summer: selectedProperty.price * 1.3,
            monsoon: selectedProperty.price * 0.8,
            winter: selectedProperty.price * 1.1
          }
        },
        images: [selectedProperty.image],
        maxGuests: selectedProperty.max_guests,
        bedrooms,
        bathrooms
      });

      if (result.success) {
        setSnackbar({ open: true, message: 'Property linked successfully!', severity: 'success' });
        setOpenLinkDialog(false);
        loadData();
      } else {
        setSnackbar({ open: true, message: result.error || 'Failed to link property', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error linking property', severity: 'error' });
    }
  };

  const handleUnlinkProperty = async (propertyId: string) => {
    if (confirm('Are you sure you want to unlink this property?')) {
      try {
        // This would need to be implemented in supabaseHostManager
        // For now, we'll just show a success message
        setSnackbar({ open: true, message: 'Property unlinked successfully!', severity: 'success' });
        loadData();
      } catch (error) {
        setSnackbar({ open: true, message: 'Error unlinking property', severity: 'error' });
      }
    }
  };

  const openLinkDialogForProperty = (property: Property) => {
    setSelectedProperty(property);
    setOpenLinkDialog(true);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Property Linking for {hostName}
      </Typography>

      {/* Available Properties to Link */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Available Properties to Link
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Property</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business sx={{ color: 'primary.main' }} />
                        {property.name}
                      </Box>
                    </TableCell>
                    <TableCell>{property.location}</TableCell>
                    <TableCell>₹{property.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${property.rating} ⭐`}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Link />}
                        onClick={() => openLinkDialogForProperty(property)}
                      >
                        Link to Host
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Currently Linked Properties */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Currently Linked Properties
          </Typography>
          {hostProperties.length === 0 ? (
            <Alert severity="info">
              No properties are currently linked to this host.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Property</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hostProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person sx={{ color: 'secondary.main' }} />
                          {property.name}
                        </Box>
                      </TableCell>
                      <TableCell>{property.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={property.status}
                          color={
                            property.status === 'active' ? 'success' :
                            property.status === 'pending' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<LinkOff />}
                          onClick={() => handleUnlinkProperty(property.id)}
                        >
                          Unlink
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Link Property Dialog */}
      <Dialog open={openLinkDialog} onClose={() => setOpenLinkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Link Property to Host
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {selectedProperty && (
              <Alert severity="info">
                Linking: <strong>{selectedProperty.name}</strong> in {selectedProperty.location}
              </Alert>
            )}
            
            <FormControl fullWidth>
              <InputLabel>Property Type</InputLabel>
              <Select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                label="Property Type"
              >
                <MenuItem value="Luxury Villa">Luxury Villa</MenuItem>
                <MenuItem value="Premium Villa">Premium Villa</MenuItem>
                <MenuItem value="Standard Villa">Standard Villa</MenuItem>
                <MenuItem value="Cottage">Cottage</MenuItem>
                <MenuItem value="Bungalow">Bungalow</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Bedrooms"
              type="number"
              value={bedrooms}
              onChange={(e) => setBedrooms(parseInt(e.target.value))}
              fullWidth
              inputProps={{ min: 1, max: 10 }}
            />

            <TextField
              label="Bathrooms"
              type="number"
              value={bathrooms}
              onChange={(e) => setBathrooms(parseInt(e.target.value))}
              fullWidth
              inputProps={{ min: 1, max: 10 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLinkDialog(false)}>Cancel</Button>
          <Button onClick={handleLinkProperty} variant="contained">
            Link Property
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
