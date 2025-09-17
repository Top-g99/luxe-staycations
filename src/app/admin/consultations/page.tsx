'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Videocam as VideocamIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { consultationManager } from '@/lib/managers/ConsultationManager';

interface Consultation {
  id: string;
  name: string;
  email: string;
  phone: string;
  property_type: string;
  location: string;
  budget?: string;
  message?: string;
  status: 'pending' | 'scheduled' | 'completed';
  created_at: string;
  updated_at: string;
}

export default function ConsultationsManagement() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [open, setOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [formData, setFormData] = useState<Partial<Consultation>>({
    name: '',
    email: '',
    phone: '',
    property_type: '',
    location: '',
    budget: '',
    message: '',
    status: 'pending'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      setIsLoading(true);
      const result = await consultationManager.getAllConsultations();
      setConsultations(result || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading consultations:', error);
      setSnackbar({ open: true, message: 'Failed to load consultations', severity: 'error' });
      setIsLoading(false);
    }
  };

  const handleOpen = (consultation?: Consultation) => {
    if (consultation) {
      setEditingConsultation(consultation);
      setFormData(consultation);
    } else {
      setEditingConsultation(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        property_type: '',
        location: '',
        budget: '',
        message: '',
        status: 'pending'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingConsultation(null);
  };

  const handleSave = async () => {
    try {
      if (editingConsultation) {
        await consultationManager.updateConsultation(editingConsultation.id, formData as Consultation);
        setSnackbar({ open: true, message: 'Consultation updated successfully!', severity: 'success' });
      } else {
        await consultationManager.createConsultation({
          name: formData.name || '',
          email: formData.email || '',
          phone: formData.phone || '',
          property_type: formData.property_type || '',
          location: formData.location || '',
          budget: formData.budget || '',
          message: formData.message || '',
          status: formData.status || 'pending'
        });
        setSnackbar({ open: true, message: 'Consultation created successfully!', severity: 'success' });
      }
      loadConsultations();
      handleClose();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save consultation', severity: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await consultationManager.deleteConsultation(id);
      setSnackbar({ open: true, message: 'Consultation deleted successfully!', severity: 'success' });
      loadConsultations();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete consultation', severity: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'scheduled': return 'info';
      default: return 'warning';
    }
  };

  const getConsultationType = (propertyType: string) => {
    // Mock logic to determine consultation type
    if (propertyType.toLowerCase().includes('villa')) return 'Video';
    return 'Phone';
  };

  const getConsultationIcon = (propertyType: string) => {
    if (propertyType.toLowerCase().includes('villa')) return <VideocamIcon />;
    return <PhoneIcon />;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading consultations...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Consultation Requests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage consultation requests and property inquiries
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ backgroundColor: '#8B4513', '&:hover': { backgroundColor: '#A0522D' } }}
        >
          VIEW ALL REQUESTS
        </Button>
      </Box>

      {/* Consultations Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Property</strong></TableCell>
                <TableCell><strong>Preferred Date</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Submitted</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {consultations.map((consultation) => (
                <TableRow key={consultation.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      consultation_{consultation.id.slice(-8)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{consultation.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{consultation.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getConsultationIcon(consultation.property_type)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {getConsultationType(consultation.property_type)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {consultation.property_type} - {consultation.location}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(consultation.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={consultation.status}
                      color={getStatusColor(consultation.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(consultation.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => handleOpen(consultation)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Schedule">
                        <IconButton size="small">
                          <ScheduleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Approve">
                        <IconButton size="small" color="success">
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton size="small" color="error">
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Consultation Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingConsultation ? 'Edit Consultation' : 'Add New Consultation'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <TextField
                fullWidth
                label="Property Type"
                value={formData.property_type}
                onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <TextField
                fullWidth
                label="Budget"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingConsultation ? 'Update' : 'Add'} Consultation
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
    </Box>
  );
}