'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
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
  Tooltip
} from '@mui/material';
import {
  PersonAdd,
  Diamond,
  TrendingUp,
  Settings,
  Edit,
  Visibility,
  Refresh
} from '@mui/icons-material';

interface GuestAccount {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_verified: boolean;
  created_at: string;
}

interface LoyaltySummary {
  user_id: string;
  total_jewels_balance: number;
  total_jewels_earned: number;
  total_jewels_redeemed: number;
  active_jewels_balance: number;
  tier: string;
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
      id={`guest-loyalty-tabpanel-${index}`}
      aria-labelledby={`guest-loyalty-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function GuestLoyaltyIntegration() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState<GuestAccount[]>([]);
  const [loyaltyData, setLoyaltyData] = useState<{[key: string]: LoyaltySummary}>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<GuestAccount | null>(null);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    loadGuestData();
  }, []);

  const loadGuestData = async () => {
    try {
      setLoading(true);
      
      // Load guest accounts
      const guestsResponse = await fetch('/api/admin/guest-accounts');
      const guestsData = await guestsResponse.json();
      
      if (guestsData.success) {
        setGuests(guestsData.guests || []);
        
        // Load loyalty data for each guest
        const loyaltyPromises = guestsData.guests.map(async (guest: GuestAccount) => {
          const loyaltyResponse = await fetch(`/api/user/loyalty?user_id=${guest.id}`);
          const loyaltyData = await loyaltyResponse.json();
          return { guestId: guest.id, data: loyaltyData.user_summary };
        });
        
        const loyaltyResults = await Promise.all(loyaltyPromises);
        const loyaltyMap: {[key: string]: LoyaltySummary} = {};
        loyaltyResults.forEach(({ guestId, data }) => {
          if (data) {
            loyaltyMap[guestId] = data;
          }
        });
        
        setLoyaltyData(loyaltyMap);
      } else {
        setError(guestsData.error || 'Failed to load guest data');
      }
    } catch (error) {
      setError('Failed to load guest data');
      console.error('Load guest data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustment = async () => {
    if (!selectedGuest || !adjustmentAmount || !adjustmentReason) return;

    try {
      setAdjusting(true);
      const response = await fetch('/api/admin/loyalty/adjustment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedGuest.id,
          adjustment_type: 'add',
          amount: parseInt(adjustmentAmount),
          reason: adjustmentReason,
          admin_notes: 'Guest loyalty adjustment'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setAdjustmentDialogOpen(false);
        setSelectedGuest(null);
        setAdjustmentAmount('');
        setAdjustmentReason('');
        loadGuestData();
      } else {
        setError(data.error || 'Failed to apply adjustment');
      }
    } catch (error) {
      setError('Failed to apply adjustment');
      console.error('Adjustment error:', error);
    } finally {
      setAdjusting(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'secondary';
      case 'gold': return 'warning';
      case 'silver': return 'default';
      case 'bronze': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#5a3d35' }}>
        👥 Guest & Loyalty Integration
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Manage guest accounts and their loyalty program integration.
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #5a3d35, #d97706)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PersonAdd sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {guests.length}
                  </Typography>
                  <Typography variant="body2">Total Guests</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #5a3d35, #d97706)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Diamond sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {guests.filter(g => loyaltyData[g.id]).length}
                  </Typography>
                  <Typography variant="body2">With Loyalty</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #5a3d35, #d97706)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {Object.values(loyaltyData).reduce((sum, data) => sum + (data?.active_jewels_balance || 0), 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">Total Jewels</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #5a3d35, #d97706)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Settings sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {guests.filter(g => g.is_verified).length}
                  </Typography>
                  <Typography variant="body2">Verified</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Guests" />
          <Tab label="Loyalty Members" />
          <Tab label="Unverified" />
        </Tabs>
      </Box>

      {/* Guest Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {tabValue === 0 && 'All Guest Accounts'}
              {tabValue === 1 && 'Loyalty Program Members'}
              {tabValue === 2 && 'Unverified Guests'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadGuestData}
            >
              Refresh
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Guest</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Loyalty</TableCell>
                  <TableCell>Jewels</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {guests
                  .filter(guest => {
                    if (tabValue === 1) return loyaltyData[guest.id];
                    if (tabValue === 2) return !guest.is_verified;
                    return true;
                  })
                  .map((guest) => {
                    const loyalty = loyaltyData[guest.id];
                    return (
                      <TableRow key={guest.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {guest.first_name} {guest.last_name}
                          </Typography>
                        </TableCell>
                        <TableCell>{guest.email}</TableCell>
                        <TableCell>{guest.phone}</TableCell>
                        <TableCell>
                          <Chip
                            label={guest.is_verified ? 'Verified' : 'Unverified'}
                            color={guest.is_verified ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {loyalty ? (
                            <Chip
                              label={loyalty.tier}
                              color={getTierColor(loyalty.tier) as any}
                              size="small"
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No loyalty account
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {loyalty ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Diamond sx={{ fontSize: 16, color: '#ffd700', mr: 0.5 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {loyalty.active_jewels_balance}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(guest.created_at)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedGuest(guest);
                                  // Open details dialog
                                }}
                                color="primary"
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            {loyalty && (
                              <Tooltip title="Adjust Jewels">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedGuest(guest);
                                    setAdjustmentDialogOpen(true);
                                  }}
                                  color="warning"
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Adjustment Dialog */}
      <Dialog open={adjustmentDialogOpen} onClose={() => setAdjustmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Adjust Jewels for {selectedGuest?.first_name} {selectedGuest?.last_name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Jewel Amount"
              type="number"
              fullWidth
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Reason"
              fullWidth
              multiline
              rows={3}
              value={adjustmentReason}
              onChange={(e) => setAdjustmentReason(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustmentDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAdjustment}
            variant="contained"
            disabled={adjusting || !adjustmentAmount || !adjustmentReason}
            sx={{
              background: 'linear-gradient(45deg, #5a3d35, #d97706)',
              '&:hover': { background: 'linear-gradient(45deg, #4a332c, #b45309)' }
            }}
          >
            {adjusting ? <CircularProgress size={20} /> : 'Apply Adjustment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

