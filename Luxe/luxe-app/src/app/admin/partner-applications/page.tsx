"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
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
  Alert,
  Snackbar,
  LinearProgress,
  Grid
} from '@mui/material';
import {
  Visibility,
  Delete,
  CheckCircle,
  Cancel,
  Schedule,
  Business,
  Email,
  Phone,
  LocationOn,
  Language,
  TrendingUp,
  People,
  Star
} from '@mui/icons-material';
import { isAdmin, hasAdminPermission, getAdminPermissionError } from '@/lib/adminPermissions';

interface PartnerApplication {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  businessType: string;
  location: string;
  description: string;
  website: string;
  socialMedia: string;
  experience: string;
  partnershipGoals: string;
  expectedRevenue: string;
  marketingBudget: string;
  targetAudience: string;
  competitiveAdvantage: string;
  propertyImages: string[];
  propertyDetails: {
    propertyName: string;
    propertyType: string;
    numberOfRooms: string;
    amenities: string[];
    propertyDescription: string;
    propertyLocation: string;
    propertyPrice: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminPartnerApplicationsPage() {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<PartnerApplication | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Load real-time partner applications from PartnerManager
  useEffect(() => {
    const loadApplications = async () => {
      try {
        // Use a more robust import approach
        let partnerManager;
        try {
          const module = await import('@/lib/partnerManager');
          partnerManager = module.partnerManager;
        } catch (importError) {
          console.error('Failed to import partnerManager:', importError);
          setLoading(false);
          return;
        }
        
        if (!partnerManager) {
          console.error('partnerManager not found in module');
          setLoading(false);
          return;
        }
        
        if (typeof window !== 'undefined') {
          try {
            partnerManager.initialize();
          } catch (initError) {
            console.error('Failed to initialize partnerManager:', initError);
          }
        }
        
        try {
          const allApplications = partnerManager.getAllApplications();
          setApplications(allApplications || []);
        } catch (getError) {
          console.error('Failed to get applications:', getError);
          setApplications([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading partner applications:', error);
        setApplications([]);
        setLoading(false);
      }
    };

    loadApplications();

    // Subscribe to real-time updates
    let unsubscribe: (() => void) | null = null;
    const setupSubscription = async () => {
      try {
        const module = await import('@/lib/partnerManager');
        const partnerManager = module.partnerManager;
        
        if (partnerManager && typeof partnerManager.subscribe === 'function') {
          unsubscribe = partnerManager.subscribe(() => {
            try {
              const updatedApplications = partnerManager.getAllApplications();
              console.log('Partner applications updated in real-time:', updatedApplications);
              setApplications(updatedApplications || []);
            } catch (error) {
              console.error('Error in subscription callback:', error);
            }
          });
        }
      } catch (error) {
        console.error('Failed to setup subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      }
    };
  }, []);

  const handleViewApplication = (application: PartnerApplication) => {
    setSelectedApplication(application);
    setDialogOpen(true);
  };

  const handleDeleteApplication = async (application: PartnerApplication) => {
    if (!hasAdminPermission('delete', 'partner application')) {
      setSnackbar({
        open: true,
        message: getAdminPermissionError('delete', 'partner application'),
        severity: 'error'
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the application from ${application.businessName}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete from partner manager
      const module = await import('@/lib/partnerManager');
      const partnerManager = module.partnerManager;
      
      if (partnerManager && typeof partnerManager.deleteApplication === 'function') {
        partnerManager.deleteApplication(application.id);
      }

      // Remove from local state
      setApplications(prev => prev.filter(app => app.id !== application.id));

      setSnackbar({
        open: true,
        message: 'Partner application deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting partner application:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting partner application',
        severity: 'error'
      });
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const module = await import('@/lib/partnerManager');
      const partnerManager = module.partnerManager;
      
      if (!partnerManager) {
        throw new Error('partnerManager not available');
      }
      
      switch (newStatus) {
        case 'approved':
          if (typeof partnerManager.approveApplication === 'function') {
            partnerManager.approveApplication(applicationId);
          }
          setSnackbar({
            open: true,
            message: 'Application approved successfully',
            severity: 'success'
          });
          break;
        case 'rejected':
          if (typeof partnerManager.rejectApplication === 'function') {
            partnerManager.rejectApplication(applicationId);
          }
          setSnackbar({
            open: true,
            message: 'Application rejected successfully',
            severity: 'info'
          });
          break;
        case 'contacted':
          if (typeof partnerManager.putUnderReview === 'function') {
            partnerManager.putUnderReview(applicationId);
          }
          setSnackbar({
            open: true,
            message: 'Application marked as contacted',
            severity: 'info'
          });
          break;
        default:
          if (typeof partnerManager.updateApplication === 'function') {
            partnerManager.updateApplication(applicationId, { status: newStatus as any });
          }
          setSnackbar({
            open: true,
            message: 'Application status updated successfully',
            severity: 'success'
          });
      }
    } catch (error) {
      console.error('Error changing application status:', error);
      setSnackbar({
        open: true,
        message: 'Error updating application status',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'contacted': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'contacted': return <Schedule />;
      default: return <Schedule />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading partner applications...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Partner Applications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage partner applications and review business proposals
        </Typography>
      </Box>

      {applications.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Partner Applications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Partner applications will appear here once submitted.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Business Name</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Business Type</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {application.businessName}
                    </Typography>
                  </TableCell>
                  <TableCell>{application.contactPerson}</TableCell>
                  <TableCell>{application.email}</TableCell>
                  <TableCell>{application.businessType}</TableCell>
                  <TableCell>{application.location}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(application.status)}
                      label={application.status}
                      color={getStatusColor(application.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewApplication(application)}
                      >
                        <Visibility />
                      </IconButton>
                      {isAdmin() && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteApplication(application)}
                          sx={{ color: '#f44336' }}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Application Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedApplication && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {selectedApplication.businessName}
                </Typography>
                <Chip
                  icon={getStatusIcon(selectedApplication.status)}
                  label={selectedApplication.status}
                  color={getStatusColor(selectedApplication.status) as any}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Contact Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Contact Person:</strong> {selectedApplication.contactPerson}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedApplication.email}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {selectedApplication.phone}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Business Details
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Business Type:</strong> {selectedApplication.businessType}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Location:</strong> {selectedApplication.location}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Website:</strong> {selectedApplication.website}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2">
                    {selectedApplication.description}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Partnership Goals
                  </Typography>
                  <Typography variant="body2">
                    {selectedApplication.partnershipGoals}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Expected Revenue
                  </Typography>
                  <Typography variant="body2">
                    {selectedApplication.expectedRevenue}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Marketing Budget
                  </Typography>
                  <Typography variant="body2">
                    {selectedApplication.marketingBudget}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => handleStatusChange(selectedApplication.id, 'contacted')}
                variant="outlined"
                color="warning"
              >
                Mark as Contacted
              </Button>
              <Button
                onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                variant="outlined"
                color="error"
              >
                Reject
              </Button>
              <Button
                onClick={() => handleStatusChange(selectedApplication.id, 'approved')}
                variant="contained"
                color="success"
              >
                Approve
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
