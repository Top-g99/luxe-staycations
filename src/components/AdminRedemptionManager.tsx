"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Diamond,
  CheckCircle,
  Cancel,
  Visibility,
  Refresh,
  TrendingUp,
  RequestPage,
  History
} from '@mui/icons-material';

interface RedemptionRequest {
  id: string;
  guest_id: string;
  jewels_to_redeem: number;
  redemption_reason: string;
  contact_preference: string;
  special_notes: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string;
  created_at: string;
  processed_at?: string;
  processed_by?: string;
  guest?: {
    id: string;
    email: string;
    name?: string;
  };
  loyalty_summary?: {
    active_jewels_balance: number;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`redemption-tabpanel-${index}`}
      aria-labelledby={`redemption-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminRedemptionManager() {
  const [redemptionRequests, setRedemptionRequests] = useState<RedemptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<RedemptionRequest | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadRedemptionRequests();
  }, []);

  const loadRedemptionRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/loyalty/redemption-requests');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch redemption requests');
      }

      setRedemptionRequests(result.data || []);
      
      // Check if setup is required
      if (result.setup_required) {
        setAlert({
          open: true,
          message: result.message || 'Database setup required for loyalty redemption system',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Error loading redemption requests:', error);
      setAlert({
        open: true,
        message: 'Failed to load redemption requests',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getFilteredRequests = () => {
    switch (tabValue) {
      case 0: // Pending
        return redemptionRequests.filter(req => req.status === 'pending');
      case 1: // Approved
        return redemptionRequests.filter(req => req.status === 'approved');
      case 2: // Rejected
        return redemptionRequests.filter(req => req.status === 'rejected');
      default:
        return redemptionRequests;
    }
  };

  const handleViewDetails = (request: RedemptionRequest) => {
    setSelectedRequest(request);
    setDetailModalOpen(true);
  };

  const handleProcessRequest = (request: RedemptionRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setAdminNotes('');
    setApprovalModalOpen(true);
  };

  const submitApproval = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/loyalty/redemption-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedRequest.status === 'pending' ? 'approved' : 'rejected',
          admin_notes: adminNotes,
          admin_id: 'admin_user_id' // In production, get from auth context
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process request');
      }

      setAlert({
        open: true,
        message: `Redemption request ${selectedRequest.status === 'pending' ? 'approved' : 'rejected'} successfully`,
        severity: 'success'
      });

      setApprovalModalOpen(false);
      setDetailModalOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');

      // Refresh the list
      loadRedemptionRequests();

    } catch (error) {
      console.error('Error processing request:', error);
      setAlert({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to process request',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} sx={{ color: 'var(--primary-light)' }} />
        </Box>
      </Container>
    );
  }

  const filteredRequests = getFilteredRequests();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ 
          fontFamily: 'Playfair Display, serif',
          fontWeight: 700,
          color: 'var(--primary-dark)',
          mb: 2
        }}>
          💎 Loyalty Redemption Management
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Review and process guest jewel redemption requests
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <RequestPage sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {redemptionRequests.filter(r => r.status === 'pending').length}
              </Typography>
              <Typography variant="body2">Pending Requests</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {redemptionRequests.filter(r => r.status === 'approved').length}
              </Typography>
              <Typography variant="body2">Approved</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Cancel sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {redemptionRequests.filter(r => r.status === 'rejected').length}
              </Typography>
              <Typography variant="body2">Rejected</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {redemptionRequests.reduce((sum, r) => sum + r.jewels_to_redeem, 0)}
              </Typography>
              <Typography variant="body2">Total Jewels</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="redemption request tabs">
            <Tab 
              label={`Pending (${redemptionRequests.filter(r => r.status === 'pending').length})`} 
              icon={<RequestPage />} 
              iconPosition="start"
            />
            <Tab 
              label={`Approved (${redemptionRequests.filter(r => r.status === 'approved').length})`} 
              icon={<CheckCircle />} 
              iconPosition="start"
            />
            <Tab 
              label={`Rejected (${redemptionRequests.filter(r => r.status === 'rejected').length})`} 
              icon={<Cancel />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Pending Redemption Requests</Typography>
            <Button
              startIcon={<Refresh />}
              onClick={loadRedemptionRequests}
              variant="outlined"
            >
              Refresh
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6">Approved Redemption Requests</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6">Rejected Redemption Requests</Typography>
        </TabPanel>

        {/* Table */}
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Guest</TableCell>
                <TableCell>Jewels</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {request.guest?.name || 'Guest'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {request.guest?.email || request.guest_id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Diamond sx={{ color: '#ffd700', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {request.jewels_to_redeem}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200 }}>
                      {request.redemption_reason}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={request.contact_preference} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={request.status} 
                      color={getStatusColor(request.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {formatDate(request.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(request)}
                          color="primary"
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      {request.status === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              onClick={() => handleProcessRequest(request, 'approve')}
                              color="success"
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              onClick={() => handleProcessRequest(request, 'reject')}
                              color="error"
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredRequests.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              No {tabValue === 0 ? 'pending' : tabValue === 1 ? 'approved' : 'rejected'} redemption requests found.
            </Typography>
            
            {tabValue === 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  This could mean:
                </Typography>
                <Box component="ul" sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
                  <Typography component="li" variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    • No guests have submitted redemption requests yet
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    • The database table needs to be set up
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    • Guests haven't started using the loyalty program
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    To set up the database, run the SQL schema file:
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    fontFamily: 'monospace', 
                    backgroundColor: '#f5f5f5', 
                    p: 1, 
                    borderRadius: 1,
                    fontSize: '0.875rem'
                  }}>
                    psql -d your_database -f loyalty-redemption-requests-schema.sql
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#fff3cd', borderRadius: 2, border: '1px solid #ffeaa7' }}>
                  <Typography variant="body2" sx={{ color: '#856404', fontWeight: 500, mb: 1 }}>
                    ⚠️ Setup Required
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#856404', fontSize: '0.875rem' }}>
                    The loyalty redemption system is currently in setup mode. Once you run the SQL schema file, 
                    the system will be fully functional and you can start processing redemption requests.
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Card>

      {/* Request Details Modal */}
      <Dialog 
        open={detailModalOpen} 
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Redemption Request Details
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Guest Information
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {selectedRequest.guest?.email || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Contact Preference:</strong> {selectedRequest.contact_preference}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Current Balance:</strong> {selectedRequest.loyalty_summary?.active_jewels_balance || 'N/A'} jewels
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Request Details
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Jewels Requested:</strong> {selectedRequest.jewels_to_redeem}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Status:</strong> 
                  <Chip 
                    label={selectedRequest.status} 
                    color={getStatusColor(selectedRequest.status) as any}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Created:</strong> {formatDate(selectedRequest.created_at)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Redemption Reason
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedRequest.redemption_reason}
                </Typography>
                
                {selectedRequest.special_notes && (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Special Notes
                    </Typography>
                    <Typography variant="body2">
                      {selectedRequest.special_notes}
                    </Typography>
                  </>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval/Rejection Modal */}
      <Dialog 
        open={approvalModalOpen} 
        onClose={() => setApprovalModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Process Redemption Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 3 }}>
                You are about to {selectedRequest.status === 'pending' ? 'approve' : 'reject'} a redemption request for{' '}
                <strong>{selectedRequest.jewels_to_redeem} jewels</strong> from{' '}
                <strong>{selectedRequest.guest?.email || 'Guest'}</strong>.
              </Typography>
              
              <TextField
                fullWidth
                label="Admin Notes"
                multiline
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes about this decision..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalModalOpen(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submitApproval}
            disabled={processing}
            color={selectedRequest?.status === 'pending' ? 'success' : 'error'}
          >
            {processing ? (
              <CircularProgress size={20} sx={{ color: 'white' }} />
            ) : (
              `${selectedRequest?.status === 'pending' ? 'Approve' : 'Reject'} Request`
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
