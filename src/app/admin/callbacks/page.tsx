'use client';

import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { callbackManager } from '@/lib/managers';

interface CallbackRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  status: 'pending' | 'contacted' | 'resolved';
  created_at: string;
  updated_at: string;
}

export default function CallbacksManagement() {
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [open, setOpen] = useState(false);
  const [editingCallback, setEditingCallback] = useState<CallbackRequest | null>(null);
  const [formData, setFormData] = useState<Partial<CallbackRequest>>({
    name: '',
    email: '',
    phone: '',
    message: '',
    status: 'pending'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCallbacks();
  }, []);

  const loadCallbacks = async () => {
    try {
      setIsLoading(true);
      const result = await callbackManager.getAllCallbacks();
      setCallbacks(result || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading callbacks:', error);
      setSnackbar({ open: true, message: 'Failed to load callbacks', severity: 'error' });
      setIsLoading(false);
    }
  };

  const handleOpen = (callback?: CallbackRequest) => {
    if (callback) {
      setEditingCallback(callback);
      setFormData(callback);
    } else {
      setEditingCallback(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        status: 'pending'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCallback(null);
  };

  const handleSave = async () => {
    try {
      if (editingCallback) {
        // Update existing callback
        await callbackManager.updateCallback(editingCallback.id, formData as CallbackRequest);
        setSnackbar({ open: true, message: 'Callback updated successfully!', severity: 'success' });
      } else {
        // Add new callback
        await callbackManager.createCallback({
          name: formData.name || '',
          email: formData.email || '',
          phone: formData.phone || '',
          message: formData.message || '',
          status: formData.status || 'pending'
        });
        setSnackbar({ open: true, message: 'Callback created successfully!', severity: 'success' });
      }
      loadCallbacks();
      handleClose();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save callback', severity: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await callbackManager.deleteCallback(id);
      setSnackbar({ open: true, message: 'Callback deleted successfully!', severity: 'success' });
      loadCallbacks();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete callback', severity: 'error' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircleIcon color="success" />;
      case 'contacted': return <PhoneIcon color="info" />;
      default: return <PendingIcon color="warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'contacted': return 'info';
      default: return 'warning';
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Loading callbacks...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Callback Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Manage callback requests and customer inquiries
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ mb: 2 }}
        >
          Add New Callback
        </Button>
      </Box>

      {/* Callbacks Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {callbacks.map((callback) => (
                  <TableRow key={callback.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{callback.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{callback.email}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {callback.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {callback.message || 'No message'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(callback.status)}
                        label={callback.status}
                        color={getStatusColor(callback.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(callback.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpen(callback)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(callback.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Callback Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCallback ? 'Edit Callback' : 'Add New Callback'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="contacted">Contacted</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingCallback ? 'Update' : 'Add'} Callback
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
