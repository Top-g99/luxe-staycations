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
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  Diamond,
  TrendingUp,
  History,
  Star,
  Redeem,
  AccountCircle,
  CalendarToday,
  AttachMoney,
  Logout,
  RequestPage
} from '@mui/icons-material';

interface GuestLoyaltyData {
  guest_id: string;
  guest_email: string;
  active_balance: number;
  total_earned: number;
  total_redeemed: number;
  pending_redemptions: number;
  tier: {
    current: string;
    next: string;
    jewels_to_next: number;
    multiplier: number;
  };
  transactions: Array<{
    id: string;
    type: 'earned' | 'redeemed' | 'pending';
    amount: number;
    description: string;
    date: string;
    status?: 'pending' | 'approved' | 'rejected';
  }>;
}

interface RedemptionRequest {
  jewels_to_redeem: number;
  redemption_reason: string;
  contact_preference: string;
  special_notes: string;
}

export default function GuestLoyaltyDashboard({ 
  guestId, 
  guestEmail, 
  onLogout 
}: { 
  guestId: string; 
  guestEmail: string; 
  onLogout: () => void; 
}) {
  const [loyaltyData, setLoyaltyData] = useState<GuestLoyaltyData | null>(null);
  const [redemptionModalOpen, setRedemptionModalOpen] = useState(false);
  const [redemptionRequest, setRedemptionRequest] = useState<RedemptionRequest>({
    jewels_to_redeem: 100,
    redemption_reason: '',
    contact_preference: 'email',
    special_notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Helper functions for event handling
  const handleInputChange = (field: keyof RedemptionRequest, value: string | number) => {
    setRedemptionRequest(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: keyof RedemptionRequest) => (event: SelectChangeEvent) => {
    handleInputChange(field, event.target.value);
  };

  useEffect(() => {
    // Load guest-specific loyalty data
    loadGuestLoyaltyData();
  }, [guestId]);

  const loadGuestLoyaltyData = () => {
    // For demo purposes, create guest-specific mock data
    // In production, this would fetch from your API using the guestId
    const mockData: GuestLoyaltyData = {
      guest_id: guestId,
      guest_email: guestEmail,
      active_balance: 1250,
      total_earned: 2000,
      total_redeemed: 750,
      pending_redemptions: 0,
      tier: {
        current: 'Gold',
        next: 'Platinum',
        jewels_to_next: 250,
        multiplier: 1.5
      },
      transactions: [
        {
          id: '1',
          type: 'earned',
          amount: 500,
          description: 'Booking at Villa Sunshine',
          date: '2024-01-15'
        },
        {
          id: '2',
          type: 'redeemed',
          amount: 300,
          description: 'Discount on Villa Moonlight',
          date: '2024-01-10',
          status: 'approved'
        },
        {
          id: '3',
          type: 'earned',
          amount: 750,
          description: 'Booking at Villa Oceanview',
          date: '2024-01-05'
        },
        {
          id: '4',
          type: 'pending',
          amount: 200,
          description: 'Redemption request for Villa Sunset',
          date: '2024-01-20',
          status: 'pending'
        }
      ]
    };

    setLoyaltyData(mockData);
  };

  const handleRedemptionRequest = async () => {
    if (redemptionRequest.jewels_to_redeem < 100) {
      setAlert({
        open: true,
        message: 'Minimum redemption amount is 100 jewels',
        severity: 'error'
      });
      return;
    }

    if (redemptionRequest.jewels_to_redeem > (loyaltyData?.active_balance || 0)) {
      setAlert({
        open: true,
        message: 'You don\'t have enough jewels for this redemption',
        severity: 'error'
      });
      return;
    }

    if (!redemptionRequest.redemption_reason.trim()) {
      setAlert({
        open: true,
        message: 'Please provide a reason for redemption',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the redemption request API
      const response = await fetch('/api/loyalty/redemption-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guest_id: guestId,
          jewels_to_redeem: redemptionRequest.jewels_to_redeem,
          redemption_reason: redemptionRequest.redemption_reason,
          contact_preference: redemptionRequest.contact_preference,
          special_notes: redemptionRequest.special_notes
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit redemption request');
      }
      
      setAlert({
        open: true,
        message: `Redemption request for ${redemptionRequest.jewels_to_redeem} jewels submitted successfully! Admin approval required.`,
        severity: 'info'
      });
      
      setRedemptionModalOpen(false);
      
      // Reset form
      setRedemptionRequest({
        jewels_to_redeem: 100,
        redemption_reason: '',
        contact_preference: 'email',
        special_notes: ''
      });
      
      // Refresh loyalty data
      loadGuestLoyaltyData();
      
    } catch (error) {
      console.error('Redemption request error:', error);
      setAlert({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to submit redemption request. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return '#cd7f32';
      case 'silver': return '#c0c0c0';
      case 'gold': return '#ffd700';
      case 'platinum': return '#e5e4e2';
      case 'diamond': return '#b9f2ff';
      default: return '#6b7280';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned': return <TrendingUp sx={{ color: '#10b981' }} />;
      case 'redeemed': return <Redeem sx={{ color: '#f59e0b' }} />;
      case 'pending': return <RequestPage sx={{ color: '#8b5cf6' }} />;
      default: return <History sx={{ color: '#6b7280' }} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned': return '#10b981';
      case 'redeemed': return '#f59e0b';
      case 'pending': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  if (!loyaltyData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          Loading your jewel wallet...
        </Typography>
      </Container>
    );
  }

  const progressPercentage = ((loyaltyData.tier.jewels_to_next - loyaltyData.tier.jewels_to_next) / loyaltyData.tier.jewels_to_next) * 100;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Guest Info */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ 
          fontFamily: 'Playfair Display, serif',
          fontWeight: 700,
          color: 'var(--primary-dark)',
          mb: 2
        }}>
          💎 Welcome to Luxe Jewels, {guestId}!
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
          Your personal jewel wallet and exclusive rewards
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Chip 
            icon={<AccountCircle />} 
            label={`Guest ID: ${guestId}`} 
            color="primary" 
            variant="outlined"
          />
          <Chip 
            icon={<AccountCircle />} 
            label={guestEmail} 
            color="secondary" 
            variant="outlined"
          />
        </Box>

        <Button
          variant="outlined"
          startIcon={<Logout />}
          onClick={() => onLogout()}
          sx={{
            borderColor: 'var(--primary-light)',
            color: 'var(--primary-dark)',
            '&:hover': {
              borderColor: 'var(--primary-dark)',
              backgroundColor: 'rgba(217, 119, 6, 0.04)'
            }
          }}
        >
          Logout
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Diamond sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {loyaltyData.active_balance.toLocaleString()}
              </Typography>
              <Typography variant="body2">Available Jewels</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {loyaltyData.total_earned.toLocaleString()}
              </Typography>
              <Typography variant="body2">Total Earned</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Redeem sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {loyaltyData.total_redeemed.toLocaleString()}
              </Typography>
              <Typography variant="body2">Total Redeemed</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <RequestPage sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {loyaltyData.pending_redemptions}
              </Typography>
              <Typography variant="body2">Pending Requests</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Tier Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ 
                fontFamily: 'Playfair Display, serif',
                fontWeight: 600,
                color: 'var(--primary-dark)',
                mb: 2
              }}>
                Current Tier: {loyaltyData.tier.current}
              </Typography>
              
              <Chip 
                label={loyaltyData.tier.current}
                sx={{ 
                  backgroundColor: getTierColor(loyaltyData.tier.current),
                  color: 'white',
                  fontWeight: 600,
                  mb: 2
                }}
              />

              {loyaltyData.tier.jewels_to_next > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {loyaltyData.tier.jewels_to_next} more jewels needed to reach {loyaltyData.tier.next} tier
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressPercentage}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: '#e5e7eb',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getTierColor(loyaltyData.tier.next)
                      }
                    }}
                  />
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Tier Benefits:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Star sx={{ color: 'var(--primary-light)' }} />
                    </ListItemIcon>
                    <ListItemText primary={`${loyaltyData.tier.multiplier}x Jewels earning rate`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AttachMoney sx={{ color: 'var(--primary-light)' }} />
                    </ListItemIcon>
                    <ListItemText primary="Priority customer support" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday sx={{ color: 'var(--primary-light)' }} />
                    </ListItemIcon>
                    <ListItemText primary="Early access to new properties" />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ 
                fontFamily: 'Playfair Display, serif',
                fontWeight: 600,
                color: 'var(--primary-dark)',
                mb: 2
              }}>
                Quick Actions
              </Typography>

              <Button
                variant="contained"
                fullWidth
                startIcon={<RequestPage />}
                onClick={() => setRedemptionModalOpen(true)}
                disabled={loyaltyData.active_balance < 100}
                sx={{
                  mb: 2,
                  background: 'var(--primary-dark)',
                  '&:hover': { background: 'var(--primary-light)' }
                }}
              >
                Request Redemption
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<History />}
                sx={{ mb: 2 }}
              >
                View Transaction History
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<AccountCircle />}
              >
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ 
                fontFamily: 'Playfair Display, serif',
                fontWeight: 600,
                color: 'var(--primary-dark)',
                mb: 2
              }}>
                Recent Transactions
              </Typography>

              {loyaltyData.transactions.length > 0 ? (
                <List>
                  {loyaltyData.transactions.map((transaction, index) => (
                    <React.Fragment key={transaction.id}>
                      <ListItem>
                        <ListItemIcon>
                          {getTransactionIcon(transaction.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={transaction.description}
                          secondary={new Date(transaction.date).toLocaleDateString()}
                        />
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              color: getTransactionColor(transaction.type)
                            }}
                          >
                            {transaction.type === 'earned' ? '+' : '-'}{transaction.amount} jewels
                          </Typography>
                          {transaction.status && (
                            <Chip 
                              label={transaction.status} 
                              size="small"
                              color={transaction.status === 'approved' ? 'success' : 
                                     transaction.status === 'pending' ? 'warning' : 'error'}
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </ListItem>
                      {index < loyaltyData.transactions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                  No transactions yet. Start earning jewels by completing your first stay!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Redemption Request Modal */}
      <Dialog 
        open={redemptionModalOpen} 
        onClose={() => setRedemptionModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          fontFamily: 'Playfair Display, serif',
          fontWeight: 600
        }}>
          <RequestPage sx={{ color: 'var(--primary-light)' }} />
          Request Jewel Redemption
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Submit a redemption request for admin approval. Your jewels will be converted to discounts once approved.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Jewels to Redeem"
                  type="number"
                  value={redemptionRequest.jewels_to_redeem}
                  onChange={(e) => handleInputChange('jewels_to_redeem', parseInt(e.target.value) || 0)}
                  inputProps={{
                    min: 100,
                    max: loyaltyData.active_balance,
                    step: 10
                  }}
                  helperText={`Available: ${loyaltyData.active_balance} jewels`}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Contact Preference</InputLabel>
                  <Select
                    value={redemptionRequest.contact_preference}
                    label="Contact Preference"
                    onChange={handleSelectChange('contact_preference')}
                  >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="phone">Phone</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Redemption Reason"
                  multiline
                  rows={3}
                  value={redemptionRequest.redemption_reason}
                  onChange={(e) => handleInputChange('redemption_reason', e.target.value)}
                  placeholder="Please describe how you would like to use these jewels (e.g., discount on next booking, special offer, etc.)"
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Special Notes (Optional)"
                  multiline
                  rows={2}
                  value={redemptionRequest.special_notes}
                  onChange={(e) => handleInputChange('special_notes', e.target.value)}
                  placeholder="Any additional information or special requests..."
                />
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Important:</strong> Redemption requests require admin approval and may take 24-48 hours to process. 
                You will be notified via your preferred contact method once the request is reviewed.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setRedemptionModalOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleRedemptionRequest()}
            disabled={isSubmitting || 
                     redemptionRequest.jewels_to_redeem < 100 || 
                     redemptionRequest.jewels_to_redeem > loyaltyData.active_balance ||
                     !redemptionRequest.redemption_reason.trim()}
            startIcon={<RequestPage />}
            sx={{
              background: 'var(--primary-dark)',
              '&:hover': { background: 'var(--primary-light)' }
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Redemption Request'}
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
