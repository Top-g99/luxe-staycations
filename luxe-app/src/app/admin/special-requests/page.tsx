'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
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
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Celebration,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  Visibility,
  FilterList,
  Search,
  PriorityHigh,
  Schedule,
  Done
} from '@mui/icons-material';
import { useBookingContext } from '@/contexts/BookingContext';
import { propertyManager } from '@/lib/dataManager';
import { isAdmin, hasAdminPermission, getAdminPermissionError } from '@/lib/adminPermissions';

export default function SpecialRequestsPage() {
  const { allBookings } = useBookingContext();
  const [specialRequests, setSpecialRequests] = useState<any[]>([]);
  
  // Initialize propertyManager for getting property names
  useEffect(() => {
    if (typeof window !== 'undefined') {
      propertyManager.initialize();
    }
  }, []);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateNotes, setUpdateNotes] = useState('');

  useEffect(() => {
    loadSpecialRequests();
  }, []);

  useEffect(() => {
    // Reload special requests when allBookings changes (from backup)
    loadFromBookingContext();
  }, [allBookings]);

  const loadFromBookingContext = () => {
    // Extract all special requests from bookings (from backup)
    const allRequests: any[] = [];
    
    allBookings.forEach(booking => {
      // Handle both old BookingContext structure and new DataManager structure
      let specialRequests = '';
      let guestName = '';
      let guestEmail = '';
      let guestPhone = '';
      let checkIn = '';
      let checkOut = '';
      let propertyName = 'Unknown Property';
      
      if (booking.guestInfo && booking.guestInfo.specialRequests) {
        // Old BookingContext structure
        specialRequests = booking.guestInfo.specialRequests;
        guestName = `${booking.guestInfo.firstName || ''} ${booking.guestInfo.lastName || ''}`.trim();
        guestEmail = booking.guestInfo.email || '';
        guestPhone = booking.guestInfo.phone || '';
        checkIn = booking.bookingDetails?.checkIn || '';
        checkOut = booking.bookingDetails?.checkOut || '';
        propertyName = booking.bookingDetails?.propertyName || 'Unknown Property';
      } else if ('guestName' in booking && 'propertyId' in booking) {
        // New DataManager structure
        specialRequests = (booking as any).specialRequests || '';
        guestName = (booking as any).guestName || '';
        guestEmail = (booking as any).guestEmail || '';
        guestPhone = (booking as any).guestPhone || '';
        checkIn = (booking as any).checkIn || '';
        checkOut = (booking as any).checkOut || '';
        // For DataManager structure, get property name from propertyId
        try {
          const property = propertyManager.getById((booking as any).propertyId);
          propertyName = property ? property.name : `Property ${(booking as any).propertyId}`;
        } catch (error) {
          propertyName = `Property ${(booking as any).propertyId}`;
        }
      }
      
      if (specialRequests && specialRequests.trim()) {
        allRequests.push({
          id: `request-${booking.id}`,
          title: 'Special Request',
          description: specialRequests,
          category: 'guest-request',
          status: 'pending',
          priority: 'medium',
          createdAt: booking.createdAt,
          bookingId: booking.id,
          guestName: guestName,
          guestEmail: guestEmail,
          guestPhone: guestPhone,
          propertyName: propertyName,
          checkIn: checkIn,
          checkOut: checkOut,
          bookingStatus: booking.status
        });
      }
    });

    setSpecialRequests(allRequests);
  };

  const loadSpecialRequests = async () => {
    // Use original approach from backup - load from BookingContext
    loadFromBookingContext();
  };


  const filteredRequests = specialRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  const handleUpdateStatus = (request: any) => {
    setSelectedRequest(request);
    setUpdateNotes(request.adminNotes || '');
    setUpdateDialogOpen(true);
  };

  const handleSaveUpdate = async () => {
    if (selectedRequest) {
      try {
        const response = await fetch(`/api/special-requests/${selectedRequest.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: selectedRequest.status,
            adminNotes: updateNotes,
            priority: selectedRequest.priority
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Update the local state
          setSpecialRequests(prev => 
            prev.map(req => 
              req.id === selectedRequest.id 
                ? { ...req, ...data.specialRequest }
                : req
            )
          );
          
          setUpdateDialogOpen(false);
          setSelectedRequest(null);
          setUpdateNotes('');
        } else {
          console.error('Failed to update special request');
        }
      } catch (error) {
        console.error('Error updating special request:', error);
      }
    }
  };

  const handleDeleteRequest = async (request: any) => {
    if (!hasAdminPermission('delete', 'special request')) {
      // Show error message instead of alert
      console.error(getAdminPermissionError('delete', 'special request'));
      return;
    }

    if (window.confirm('Are you sure you want to delete this special request? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/special-requests/${request.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Reload the special requests
          await loadSpecialRequests();
          alert('Special request deleted successfully!');
        } else {
          throw new Error('Failed to delete special request');
        }
      } catch (error) {
        console.error('Error deleting special request:', error);
        alert('Error deleting special request. Please try again.');
      }
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status || typeof status !== 'string') return 'default';
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string | undefined) => {
    if (!priority || typeof priority !== 'string') return 'default';
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Schedule />;
      case 'approved': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'completed': return <Done />;
      default: return <Schedule />;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getCategoryLabel = (category: string | undefined) => {
    if (!category || typeof category !== 'string') return 'Unknown';
    return category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" sx={{ fontWeight: 600, mb: 4, color: '#5a3d35' }}>
        Special Requests Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '2px solid #f3f4f6' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#d97706' }}>
                {specialRequests.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total Requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '2px solid #f3f4f6' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#ff9800' }}>
                {specialRequests.filter(r => r.status === 'pending').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Pending Review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '2px solid #f3f4f6' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#4caf50' }}>
                {specialRequests.filter(r => r.status === 'approved').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '2px solid #f3f4f6' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#f44336' }}>
                {specialRequests.filter(r => r.priority === 'high').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                High Priority
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 4, border: '2px solid #f3f4f6' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search requests"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by guest name, property, or request details"
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Filter by Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Priority</InputLabel>
                <Select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  label="Filter by Priority"
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="high">High Priority</MenuItem>
                  <MenuItem value="medium">Medium Priority</MenuItem>
                  <MenuItem value="low">Low Priority</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card sx={{ border: '2px solid #f3f4f6' }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Celebration sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              No Special Requests Found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                ? 'Try adjusting your filters or search terms.'
                : 'Guests haven\'t submitted any special requests yet.'
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredRequests.filter(request => request && request.id).map((request) => (
            <Grid item xs={12} key={request.id}>
              <Card sx={{ border: '2px solid #f3f4f6' }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        {getStatusIcon(request.status)}
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {request.title}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        {request.description}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                          label={getCategoryLabel(request.category)}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={request.priority}
                          color={getPriorityColor(request.priority) as any}
                          size="small"
                          icon={<PriorityHigh />}
                        />
                        <Chip
                          label={request.status}
                          color={getStatusColor(request.status) as any}
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        <strong>Guest:</strong> {request.guestName} • {request.guestEmail}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        <strong>Property:</strong> {request.propertyName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        <strong>Stay:</strong> {formatDate(request.checkIn)} - {formatDate(request.checkOut)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        <strong>Submitted:</strong> {formatDate(request.createdAt)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewDetails(request)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleUpdateStatus(request)}
                        >
                          Update Status
                        </Button>
                        {isAdmin() && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Delete />}
                            onClick={() => handleDeleteRequest(request)}
                            color="error"
                          >
                            Delete
                          </Button>
                        )}
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>
                          Booking ID: {request.bookingId}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Request Details Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Celebration sx={{ color: '#d97706' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Request Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedRequest.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedRequest.description}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Category:</Typography>
                  <Typography variant="body2">{getCategoryLabel(selectedRequest.category)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Priority:</Typography>
                  <Typography variant="body2">{selectedRequest.priority}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Status:</Typography>
                  <Typography variant="body2">{selectedRequest.status}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Type:</Typography>
                  <Typography variant="body2">{selectedRequest.type}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>Guest Information</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Name:</Typography>
                  <Typography variant="body2">{selectedRequest.guestName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Email:</Typography>
                  <Typography variant="body2">{selectedRequest.guestEmail}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Phone:</Typography>
                  <Typography variant="body2">{selectedRequest.guestPhone}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Property:</Typography>
                  <Typography variant="body2">{selectedRequest.propertyName}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>Timeline</Typography>
              <Typography variant="body2">
                <strong>Created:</strong> {formatDate(selectedRequest.createdAt)}
              </Typography>
              <Typography variant="body2">
                <strong>Last Updated:</strong> {formatDate(selectedRequest.updatedAt)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setDetailDialogOpen(false);
              handleUpdateStatus(selectedRequest);
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Request Status</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedRequest.title}
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={selectedRequest.status}
                  onChange={(e) => setSelectedRequest({
                    ...selectedRequest,
                    status: e.target.value
                  })}
                  label="New Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Admin Notes"
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                placeholder="Add notes about this request (optional)"
                helperText="These notes will be visible to the guest"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveUpdate}
            sx={{
              background: 'linear-gradient(45deg, #5a3d35, #d97706)',
              '&:hover': {
                background: 'linear-gradient(45deg, #4a332c, #b45309)',
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
