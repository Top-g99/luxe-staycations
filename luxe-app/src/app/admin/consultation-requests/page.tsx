'use client';

import React, { useState, useEffect } from 'react';
import { supabaseConsultationService } from '@/lib/supabaseConsultationService';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Phone,
  VideoCall,
  Person,
  Schedule,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  Visibility
} from '@mui/icons-material';
import { isAdmin, hasAdminPermission, getAdminPermissionError } from '@/lib/adminPermissions';

export default function AdminConsultationRequestsPage() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    scheduledDate: '',
    notes: ''
  });

  // Load consultation requests from Supabase
  useEffect(() => {
    const loadConsultations = async () => {
      try {
        const allConsultations = await supabaseConsultationService.getAllConsultations();
        setConsultations(allConsultations);
        setLoading(false);
      } catch (error) {
        console.error('Error loading consultation requests:', error);
        setLoading(false);
      }
    };

    loadConsultations();

    // Set up polling for real-time updates (every 5 seconds)
    const interval = setInterval(loadConsultations, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleViewConsultation = (consultation: any) => {
    setSelectedConsultation(consultation);
    setEditMode(false);
    setEditData({
      status: consultation.status,
      scheduledDate: consultation.scheduledDate || '',
      notes: consultation.notes || ''
    });
    setDialogOpen(true);
  };

  const handleEditConsultation = (consultation: any) => {
    setSelectedConsultation(consultation);
    setEditMode(true);
    setEditData({
      status: consultation.status,
      scheduledDate: consultation.scheduledDate || '',
      notes: consultation.notes || ''
    });
    setDialogOpen(true);
  };

  const handleDeleteConsultation = (consultation: any) => {
    if (!hasAdminPermission('delete', 'consultation request')) {
      console.error(getAdminPermissionError('delete', 'consultation request'));
      return;
    }

    if (window.confirm('Are you sure you want to delete this consultation request? This action cannot be undone.')) {
      setConsultations(prev => prev.filter(cons => cons.id !== consultation.id));
      console.log('Deleted consultation request:', consultation.id);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedConsultation) return;

    try {
      const { consultationManager } = await import('@/lib/consultationManager');
      
      consultationManager.updateConsultation(selectedConsultation.id, {
        status: editData.status as any,
        scheduledDate: editData.scheduledDate || undefined,
        notes: editData.notes || undefined
      });

      setDialogOpen(false);
      setSelectedConsultation(null);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating consultation:', error);
    }
  };

  const handleStatusChange = async (consultationId: string, newStatus: string) => {
    try {
      const { consultationManager } = await import('@/lib/consultationManager');
      
      switch (newStatus) {
        case 'scheduled':
          consultationManager.scheduleConsultation(consultationId, new Date().toISOString());
          break;
        case 'completed':
          consultationManager.completeConsultation(consultationId);
          break;
        case 'cancelled':
          consultationManager.cancelConsultation(consultationId);
          break;
        default:
          consultationManager.updateConsultation(consultationId, { status: newStatus as any });
      }
    } catch (error) {
      console.error('Error changing consultation status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'scheduled': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getConsultationTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone fontSize="small" />;
      case 'video': return <VideoCall fontSize="small" />;
      case 'in-person': return <Person fontSize="small" />;
      default: return <Phone fontSize="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Consultation Requests
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #5a3d35, #d97706)',
              '&:hover': {
                background: 'linear-gradient(45deg, #4a332c, #b45309)',
              }
            }}
          >
            View All Requests
          </Button>
                        <Button
                variant="outlined"
                onClick={async () => {
                  if (confirm('Are you sure you want to clear all consultation requests? This will remove all data from the database.')) {
                    try {
                      await supabaseConsultationService.clearAllConsultations();
                      alert('All consultation requests cleared successfully from the database!');
                      // Reload the data
                      const allConsultations = await supabaseConsultationService.getAllConsultations();
                      setConsultations(allConsultations);
                    } catch (error) {
                      console.error('Error clearing consultations:', error);
                      alert('Error clearing consultations. Please try again.');
                    }
                  }
                }}
            sx={{
              borderColor: '#dc2626',
              color: '#dc2626',
              '&:hover': {
                borderColor: '#b91c1c',
                backgroundColor: 'rgba(220, 38, 38, 0.1)'
              }
            }}
          >
            Clear All Data
          </Button>
                      <Button
              variant="outlined"
              onClick={async () => {
                try {
                  console.log('=== CONSULTATION DEBUG INFO ===');
                  
                  // Check Supabase service
                  console.log('Supabase consultation service available:', !!supabaseConsultationService);
                  
                  // Test API
                  const response = await fetch('/api/consultations');
                  const data = await response.json();
                  console.log('API response:', data);

                  // Get current consultations from service
                  const currentConsultations = await supabaseConsultationService.getAllConsultations();
                  console.log('Current consultations from service:', currentConsultations);

                  alert('Debug info logged to console. Check browser console for details.');
                } catch (error) {
                  console.error('Debug error:', error);
                  alert('Debug failed. Check console for error.');
                }
              }}
            sx={{
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: 'rgba(25, 118, 210, 0.1)'
              }
            }}
          >
            Debug Info
          </Button>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      {consultations.length === 0 && !loading ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No Consultation Requests Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              When partners submit consultation requests through the partner page, they will appear here.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The system is ready to receive live consultation requests.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Property</TableCell>
                    <TableCell>Preferred Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {consultations.map((consultation) => (
                    <TableRow key={consultation.id}>
                      <TableCell>{consultation.id}</TableCell>
                      <TableCell>{consultation.name}</TableCell>
                      <TableCell>{consultation.email}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getConsultationTypeIcon(consultation.consultationType)}
                          {consultation.consultationType}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {consultation.propertyType} - {consultation.location}
                      </TableCell>
                      <TableCell>
                        {formatDate(consultation.preferredDate)} at {formatTime(consultation.preferredTime)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={consultation.status}
                          color={getStatusColor(consultation.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(consultation.submittedDate)}</TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewConsultation(consultation)}
                          sx={{ color: '#d97706' }}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditConsultation(consultation)}
                          sx={{ color: '#d97706' }}
                        >
                          <Edit />
                        </IconButton>
                        {isAdmin() && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteConsultation(consultation)}
                            sx={{ color: '#dc2626' }}
                          >
                            <Delete />
                          </IconButton>
                        )}
                        {consultation.status === 'pending' && (
                          <>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="info"
                              startIcon={<Schedule />}
                              onClick={() => handleStatusChange(consultation.id, 'scheduled')}
                              sx={{ mr: 1 }}
                            >
                              Schedule
                            </Button>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => handleStatusChange(consultation.id, 'completed')}
                              sx={{ mr: 1 }}
                            >
                              Complete
                            </Button>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="error"
                              startIcon={<Cancel />}
                              onClick={() => handleStatusChange(consultation.id, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Consultation Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'Edit Consultation Request' : 'Consultation Request Details'}
        </DialogTitle>
        <DialogContent>
          {selectedConsultation && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: '#5a3d35' }}>
                  Contact Information
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Name:</strong> {selectedConsultation.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {selectedConsultation.email}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Phone:</strong> {selectedConsultation.phone}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Consultation Type:</strong> {selectedConsultation.consultationType}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: '#5a3d35' }}>
                  Property Information
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Type:</strong> {selectedConsultation.propertyType}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Location:</strong> {selectedConsultation.location}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Bedrooms:</strong> {selectedConsultation.bedrooms}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Bathrooms:</strong> {selectedConsultation.bathrooms}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Max Guests:</strong> {selectedConsultation.maxGuests}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: '#5a3d35' }}>
                  Consultation Details
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Preferred Date:</strong> {formatDate(selectedConsultation.preferredDate)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Preferred Time:</strong> {formatTime(selectedConsultation.preferredTime)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Property Description:</strong> {selectedConsultation.propertyDescription}
                </Typography>
                {selectedConsultation.additionalNotes && (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Additional Notes:</strong> {selectedConsultation.additionalNotes}
                  </Typography>
                )}
              </Grid>

              {editMode && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#5a3d35' }}>
                    Update Consultation
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={editData.status}
                          onChange={(e) => setEditData({...editData, status: e.target.value})}
                          label="Status"
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="scheduled">Scheduled</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Scheduled Date"
                        type="datetime-local"
                        value={editData.scheduledDate}
                        onChange={(e) => setEditData({...editData, scheduledDate: e.target.value})}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Notes"
                        multiline
                        rows={3}
                        value={editData.notes}
                        onChange={(e) => setEditData({...editData, notes: e.target.value})}
                        placeholder="Add notes about this consultation..."
                      />
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
          {editMode && (
            <Button 
              onClick={handleSaveChanges}
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4a332c, #b45309)',
                }
              }}
            >
              Save Changes
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

