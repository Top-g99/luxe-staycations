'use client';

import React, { useState, useEffect } from 'react';
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
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import { partnerAuthManager } from '@/lib/partnerAuthManager';

export default function AdminPartnerApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load real-time partner applications from PartnerManager
  useEffect(() => {
    const loadApplications = async () => {
      try {
        const { partnerManager } = await import('@/lib/partnerManager');
        
        if (typeof window !== 'undefined') {
          partnerManager.initialize();
        }
        
        const allApplications = partnerManager.getAllApplications();
        setApplications(allApplications);
        setLoading(false);
      } catch (error) {
        console.error('Error loading partner applications:', error);
        setLoading(false);
      }
    };

    loadApplications();

    // Subscribe to real-time updates
    let unsubscribe: (() => void) | null = null;
    import('@/lib/partnerManager').then(({ partnerManager }) => {
      unsubscribe = partnerManager.subscribe(() => {
        const updatedApplications = partnerManager.getAllApplications();
        console.log('Partner applications updated in real-time:', updatedApplications);
        setApplications(updatedApplications);
      });
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleViewApplication = (application: any) => {
    setSelectedApplication(application);
    setDialogOpen(true);
  };

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const { partnerManager } = await import('@/lib/partnerManager');
      
      switch (newStatus) {
        case 'approved':
          partnerManager.approveApplication(applicationId);
          
          // Create partner account when application is approved
          const application = partnerManager.getApplicationById(applicationId);
          if (application) {
            const partnerUser = partnerAuthManager.createPartnerAccount(application);
            setSnackbar({
              open: true,
              message: `Partner account created successfully! Temporary password: ${partnerUser.password}`,
              severity: 'success'
            });
          }
          break;
        case 'rejected':
          partnerManager.rejectApplication(applicationId);
          setSnackbar({
            open: true,
            message: 'Application rejected successfully',
            severity: 'info'
          });
          break;
        case 'under_review':
          partnerManager.putUnderReview(applicationId);
          setSnackbar({
            open: true,
            message: 'Application marked for review',
            severity: 'info'
          });
          break;
        default:
          partnerManager.updateApplication(applicationId, { status: newStatus as any });
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Partner Applications
        </Typography>
        <Button
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #5a3d35, #d97706)',
            '&:hover': {
              background: 'linear-gradient(45deg, #4a332c, #b45309)',
            }
          }}
        >
          View All Applications
        </Button>
      </Box>

      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Property Type</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.id}</TableCell>
                    <TableCell>{app.name}</TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>{app.propertyType}</TableCell>
                    <TableCell>{app.location}</TableCell>
                    <TableCell>
                      <Chip
                        label={app.status}
                        color={app.status === 'Approved' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{app.submittedDate}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => handleViewApplication(app)}
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                      {app.status === 'pending' && (
                        <>
                          <Button 
                            size="small" 
                            variant="contained" 
                            color="success"
                            onClick={() => handleStatusChange(app.id, 'approved')}
                            sx={{ mr: 1 }}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="small" 
                            variant="contained" 
                            color="error"
                            onClick={() => handleStatusChange(app.id, 'rejected')}
                          >
                            Reject
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

      {/* Application Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Partner Application Details
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: '#5a3d35' }}>
                  Contact Information
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Name:</strong> {selectedApplication.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {selectedApplication.email}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Phone:</strong> {selectedApplication.phone}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: '#5a3d35' }}>
                  Property Information
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Type:</strong> {selectedApplication.propertyType}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Location:</strong> {selectedApplication.location}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Bedrooms:</strong> {selectedApplication.bedrooms}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Bathrooms:</strong> {selectedApplication.bathrooms}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Max Guests:</strong> {selectedApplication.maxGuests}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: '#5a3d35' }}>
                  Property Description
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedApplication.propertyDescription}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: '#5a3d35' }}>
                  Application Status
                </Typography>
                <Chip
                  label={selectedApplication.status}
                  color={selectedApplication.status === 'approved' ? 'success' : 
                         selectedApplication.status === 'rejected' ? 'error' : 'warning'}
                  size="medium"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
          {selectedApplication && selectedApplication.status === 'pending' && (
            <>
              <Button 
                onClick={() => {
                  handleStatusChange(selectedApplication.id, 'approved');
                  setDialogOpen(false);
                }}
                variant="contained"
                color="success"
              >
                Approve
              </Button>
              <Button 
                onClick={() => {
                  handleStatusChange(selectedApplication.id, 'rejected');
                  setDialogOpen(false);
                }}
                variant="contained"
                color="error"
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

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
