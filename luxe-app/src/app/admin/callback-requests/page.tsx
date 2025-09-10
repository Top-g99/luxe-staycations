'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  IconButton,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Phone,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  FilterList,
  Refresh,
  TrendingUp,
  Schedule,
  DoneAll,
  Clear,
  Email
} from '@mui/icons-material';
import { callbackManager, CallbackRequest } from '@/lib/callbackManager';
import { contactFormManager, ContactFormSubmission } from '@/lib/contactFormManager';
import { isAdmin, hasAdminPermission, getAdminPermissionError } from '@/lib/adminPermissions';

export default function CallbackRequestsPage() {
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactFormSubmission[]>([]);
  const [filteredCallbacks, setFilteredCallbacks] = useState<CallbackRequest[]>([]);
  const [filteredContactSubmissions, setFilteredContactSubmissions] = useState<ContactFormSubmission[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all'); // 'all', 'callback', 'contact'
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCallback, setSelectedCallback] = useState<CallbackRequest | null>(null);
  const [selectedContactSubmission, setSelectedContactSubmission] = useState<ContactFormSubmission | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<CallbackRequest['status']>('pending');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadCallbacks();
    loadContactSubmissions();
    const unsubscribeCallbacks = callbackManager.subscribe(loadCallbacks);
    const unsubscribeContacts = contactFormManager.subscribe(loadContactSubmissions);
    return () => {
      unsubscribeCallbacks();
      unsubscribeContacts();
    };
  }, []);

  useEffect(() => {
    filterCallbacks();
    filterContactSubmissions();
  }, [callbacks, contactSubmissions, statusFilter, typeFilter]);

  const loadCallbacks = () => {
    setCallbacks(callbackManager.getAllCallbacks());
  };

  const loadContactSubmissions = () => {
    contactFormManager.initialize();
    setContactSubmissions(contactFormManager.getAllSubmissions());
  };

  const filterCallbacks = () => {
    if (statusFilter === 'all') {
      setFilteredCallbacks(callbacks);
    } else {
      setFilteredCallbacks(callbacks.filter(callback => callback.status === statusFilter));
    }
  };

  const filterContactSubmissions = () => {
    if (statusFilter === 'all') {
      setFilteredContactSubmissions(contactSubmissions);
    } else {
      setFilteredContactSubmissions(contactSubmissions.filter(submission => submission.status === statusFilter));
    }
  };

  const handleEditCallback = (callback: CallbackRequest) => {
    setSelectedCallback(callback);
    setEditNotes(callback.notes || '');
    setEditStatus(callback.status);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedCallback) {
      const success = callbackManager.updateCallback(
        selectedCallback.id,
        {
          status: editStatus,
          notes: editNotes
        }
      );
      if (success) {
        setSnackbar({
          open: true,
          message: 'Callback request updated successfully!',
          severity: 'success'
        });
        setEditDialogOpen(false);
        setSelectedCallback(null);
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to update callback request',
          severity: 'error'
        });
      }
    } else if (selectedContactSubmission) {
      const success = contactFormManager.updateSubmission(
        selectedContactSubmission.id,
        {
          status: editStatus as any,
          notes: editNotes
        }
      );
      
      if (success) {
        setSnackbar({
          open: true,
          message: 'Contact form submission updated successfully!',
          severity: 'success'
        });
        setEditDialogOpen(false);
        setSelectedContactSubmission(null);
        setEditNotes('');
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to update contact form submission!',
          severity: 'error'
        });
      }
    }
  };

  const handleDeleteCallback = (id: string) => {
    if (!hasAdminPermission('delete', 'callback request')) {
      setSnackbar({
        open: true,
        message: getAdminPermissionError('delete', 'callback request'),
        severity: 'error'
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this callback request?')) {
      const success = callbackManager.deleteCallback(id);
      if (success) {
        setSnackbar({
          open: true,
          message: 'Callback request deleted successfully!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to delete callback request',
          severity: 'error'
        });
      }
    }
  };

  const handleEditContactSubmission = (submission: ContactFormSubmission) => {
    setSelectedContactSubmission(submission);
    setEditNotes(submission.notes || '');
    setEditStatus(submission.status as any);
    setEditDialogOpen(true);
  };

  const handleDeleteContactSubmission = (id: string) => {
    if (!hasAdminPermission('delete', 'contact form submission')) {
      setSnackbar({
        open: true,
        message: getAdminPermissionError('delete', 'contact form submission'),
        severity: 'error'
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this contact form submission?')) {
      const success = contactFormManager.deleteSubmission(id);
      if (success) {
        setSnackbar({
          open: true,
          message: 'Contact form submission deleted successfully!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to delete contact form submission!',
          severity: 'error'
        });
      }
    }
  };

  const getStatusColor = (status: CallbackRequest['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'contacted': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: CallbackRequest['status']) => {
    switch (status) {
      case 'pending': return <Schedule />;
      case 'contacted': return <Phone />;
      case 'completed': return <DoneAll />;
      case 'cancelled': return <Cancel />;
      default: return <Schedule />;
    }
  };

  const stats = callbackManager.getStatistics();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontFamily: 'Playfair Display, serif',
          color: 'var(--primary-dark)',
          mb: 2 
        }}>
          Callback Requests & Contact Form Management
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Manage and track all guest callback requests and contact form submissions
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'var(--primary-light)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2">Total Requests</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ff9800', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2">Pending</Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#2196f3', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.contacted}
                  </Typography>
                  <Typography variant="body2">Contacted</Typography>
                </Box>
                <Phone sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#4caf50', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.completed}
                  </Typography>
                  <Typography variant="body2">Completed</Typography>
                </Box>
                <DoneAll sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Actions */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            label="Filter by Type"
            startAdornment={<FilterList />}
          >
            <MenuItem value="all">All Requests</MenuItem>
            <MenuItem value="callback">Callback Requests</MenuItem>
            <MenuItem value="contact">Contact Form</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Filter by Status"
            startAdornment={<FilterList />}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="contacted">Contacted</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>
        
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadCallbacks}
          sx={{ borderColor: 'var(--primary-light)', color: 'var(--primary-light)' }}
        >
          Refresh
        </Button>
      </Box>

      {/* Callback Requests Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'var(--primary-light)' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Contact Details</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Subject/Message</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Priority</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCallbacks.length === 0 && filteredContactSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    No requests found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {/* Callback Requests */}
                {typeFilter === 'all' || typeFilter === 'callback' ? filteredCallbacks.map((callback) => (
                <TableRow key={callback.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {callback.name}
                      </Typography>
                      {callback.message && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          {callback.message.length > 50 
                            ? `${callback.message.substring(0, 50)}...` 
                            : callback.message
                          }
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {callback.phone}
                      </Typography>
                      {callback.email && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {callback.email}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {callback.numberOfGuests || 'Not specified'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {callback.preferredTime || 'Not specified'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(callback.status)}
                      label={callback.status.charAt(0).toUpperCase() + callback.status.slice(1)}
                      color={getStatusColor(callback.status) as any}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {callback.createdAt.toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {callback.createdAt.toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditCallback(callback)}
                        sx={{ color: 'var(--primary-light)' }}
                      >
                        <Edit />
                      </IconButton>
                      {isAdmin() && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteCallback(callback.id)}
                          sx={{ color: '#f44336' }}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )) : null}
                
                {/* Contact Form Submissions */}
                {typeFilter === 'all' || typeFilter === 'contact' ? filteredContactSubmissions.map((submission) => (
                <TableRow key={`contact-${submission.id}`} hover>
                  <TableCell>
                    <Chip
                      label="Contact Form"
                      color="secondary"
                      size="small"
                      icon={<Email />}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {submission.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {submission.email}
                      </Typography>
                      {submission.phone && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {submission.phone}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {submission.subject}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {submission.message.length > 50 
                        ? `${submission.message.substring(0, 50)}...` 
                        : submission.message
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={submission.priority}
                      color={submission.priority === 'high' ? 'error' : submission.priority === 'medium' ? 'warning' : 'default'}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={submission.status}
                      color={submission.status === 'new' ? 'info' : submission.status === 'in_progress' ? 'warning' : submission.status === 'completed' ? 'success' : 'default'}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditContactSubmission(submission)}
                        sx={{ color: 'var(--primary-light)' }}
                      >
                        <Edit />
                      </IconButton>
                      {isAdmin() && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteContactSubmission(submission.id)}
                          sx={{ color: '#f44336' }}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )) : null}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: 'var(--primary-light)', 
          color: 'white',
          fontFamily: 'Playfair Display, serif'
        }}>
          {selectedCallback ? 'Update Callback Request' : 'Update Contact Form Submission'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {(selectedCallback || selectedContactSubmission) && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {selectedCallback ? 'Guest' : 'Contact'}: {selectedCallback?.name || selectedContactSubmission?.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  {selectedCallback ? 'Phone' : 'Email'}: {selectedCallback?.phone || selectedContactSubmission?.email}
                </Typography>
                {selectedContactSubmission && selectedContactSubmission.phone && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    Phone: {selectedContactSubmission.phone}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    label="Status"
                  >
                    {selectedCallback ? (
                      <>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="contacted">Contacted</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </>
                    ) : (
                      <>
                        <MenuItem value="new">New</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="closed">Closed</MenuItem>
                      </>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Admin Notes"
                  multiline
                  rows={4}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes about the callback..."
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained"
            sx={{ bgcolor: 'var(--secondary-dark)' }}
          >
            Save Changes
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



