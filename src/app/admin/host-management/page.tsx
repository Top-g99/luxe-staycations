"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Business,
  Person,
  Email,
  Phone,
  Security
} from '@mui/icons-material';
import { supabaseHostManager } from '@/lib/supabaseHostManager';
import PropertyLinking from './property-linking';
import OwnerBookings from './owner-bookings';

interface HostFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  verificationStatus: 'pending' | 'verified' | 'unverified';
  isActive: boolean;
}

interface Host {
  id: string;
  name: string;
  email: string;
  phone?: string;
  verificationStatus: string;
  memberSince: string;
  isActive: boolean;
  totalProperties: number;
}

export default function HostManagementPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingHost, setEditingHost] = useState<Host | null>(null);
  const [formData, setFormData] = useState<HostFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    verificationStatus: 'pending',
    isActive: true
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [showPropertyLinking, setShowPropertyLinking] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadHosts();
  }, []);

  const loadHosts = async () => {
    try {
      const allHosts = await supabaseHostManager.getAllHosts();
      const hostsWithStats = await Promise.all(
        allHosts.map(async (host) => {
          const stats = await supabaseHostManager.getHostStats(host.id);
          return {
            ...host,
            totalProperties: stats.totalProperties
          };
        })
      );
      setHosts(hostsWithStats);
    } catch (error) {
      console.error('Error loading hosts:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingHost) {
        // Update existing host
        const success = await supabaseHostManager.updateHost(editingHost.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          verificationStatus: formData.verificationStatus,
          isActive: formData.isActive
        });
        
        if (success) {
          setSnackbar({ open: true, message: 'Host updated successfully!', severity: 'success' });
        } else {
          setSnackbar({ open: true, message: 'Failed to update host', severity: 'error' });
          return;
        }
      } else {
        // Create new host
        const result = await supabaseHostManager.createHost({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          verificationStatus: formData.verificationStatus,
          isActive: formData.isActive
        });
        
        if (result.success) {
          setSnackbar({ open: true, message: 'Host created successfully!', severity: 'success' });
        } else {
          setSnackbar({ open: true, message: result.error || 'Failed to create host', severity: 'error' });
          return;
        }
      }
      
      setOpenDialog(false);
      resetForm();
      loadHosts();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving host', severity: 'error' });
    }
  };

  const handleEdit = (host: Host) => {
    setEditingHost(host);
    setFormData({
      name: host.name,
      email: host.email,
      phone: host.phone || '',
      password: '',
      verificationStatus: host.verificationStatus as any,
      isActive: host.isActive
    });
    setOpenDialog(true);
  };

  const handleDelete = async (hostId: string) => {
    if (confirm('Are you sure you want to delete this host?')) {
      try {
        const success = await supabaseHostManager.deleteHost(hostId);
        if (success) {
          setSnackbar({ open: true, message: 'Host deleted successfully!', severity: 'success' });
          loadHosts();
        } else {
          setSnackbar({ open: true, message: 'Failed to delete host', severity: 'error' });
        }
      } catch (error) {
        setSnackbar({ open: true, message: 'Error deleting host', severity: 'error' });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      verificationStatus: 'pending',
      isActive: true
    });
    setEditingHost(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setOpenDialog(true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
          Host Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage property host accounts, create new hosts, and assign properties
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreateDialog}
          sx={{ borderRadius: 2 }}
        >
          Create New Host
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Host Management" />
          <Tab label="Owner Bookings" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
          {/* Hosts Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                All Hosts
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Properties</TableCell>
                      <TableCell>Member Since</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hosts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            No hosts found. Create your first host account.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      hosts.map((host) => (
                        <TableRow key={host.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Person sx={{ color: 'primary.main' }} />
                              {host.name}
                            </Box>
                          </TableCell>
                          <TableCell>{host.email}</TableCell>
                          <TableCell>{host.phone || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={host.verificationStatus}
                              color={
                                host.verificationStatus === 'verified' ? 'success' :
                                host.verificationStatus === 'pending' ? 'warning' : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<Business />}
                              label={`${host.totalProperties} properties`}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{new Date(host.memberSince).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton size="small" onClick={() => handleEdit(host)}>
                                <Edit />
                              </IconButton>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  setSelectedHost(host);
                                  setShowPropertyLinking(true);
                                }}
                              >
                                Manage Properties
                              </Button>
                              <IconButton size="small" color="error" onClick={() => handleDelete(host.id)}>
                                <Delete />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 1 && (
        <OwnerBookings />
      )}

      {/* Create/Edit Host Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingHost ? 'Edit Host' : 'Create New Host'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            {!editingHost && (
              <TextField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                fullWidth
                required
                helperText="Host will use this password to login"
              />
            )}
            <FormControl fullWidth>
              <InputLabel>Verification Status</InputLabel>
              <Select
                value={formData.verificationStatus}
                onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value as any })}
                label="Verification Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="unverified">Unverified</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active Account"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingHost ? 'Update Host' : 'Create Host'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Property Linking Dialog */}
      <Dialog 
        open={showPropertyLinking} 
        onClose={() => setShowPropertyLinking(false)} 
        maxWidth="xl" 
        fullWidth
      >
        <DialogTitle>
          Property Management for {selectedHost?.name}
        </DialogTitle>
        <DialogContent>
          {selectedHost && (
            <PropertyLinking 
              hostId={selectedHost.id} 
              hostName={selectedHost.name} 
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPropertyLinking(false)}>Close</Button>
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
    </Container>
  );
}
