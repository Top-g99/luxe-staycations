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
  Snackbar
} from '@mui/material';
import {
  Diamond,
  TrendingUp,
  History,
  Star,
  Redeem,
  AccountCircle,
  CalendarToday,
  AttachMoney
} from '@mui/icons-material';
import RedeemJewelsModal from './RedeemJewelsModal';

interface LoyaltyData {
  user_id: string;
  active_balance: number;
  total_earned: number;
  total_redeemed: number;
  tier: {
    current: string;
    next: string;
    jewels_to_next: number;
    multiplier: number;
  };
  transactions: Array<{
    id: string;
    type: 'earned' | 'redeemed';
    amount: number;
    description: string;
    date: string;
  }>;
}

export default function LoyaltyDashboard() {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Load loyalty data
    loadLoyaltyData();
  }, []);

  const loadLoyaltyData = () => {
    // For demo purposes, create mock data
    const mockData: LoyaltyData = {
      user_id: 'user_123',
      active_balance: 1250,
      total_earned: 2000,
      total_redeemed: 750,
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
          date: '2024-01-10'
        },
        {
          id: '3',
          type: 'earned',
          amount: 750,
          description: 'Booking at Villa Oceanview',
          date: '2024-01-05'
        }
      ]
    };

    setLoyaltyData(mockData);
  };

  const handleRedeemSuccess = (discountAmount: number, jewelsRedeemed: number) => {
    setAlert({
      open: true,
      message: `Successfully redeemed ${jewelsRedeemed} jewels for ₹${discountAmount} discount!`,
      severity: 'success'
    });
    setRedeemModalOpen(false);
    loadLoyaltyData(); // Refresh data
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

  if (!loyaltyData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          No loyalty information found. Start earning jewels by completing your first stay!
        </Typography>
      </Container>
    );
  }

  const progressPercentage = ((loyaltyData.tier.jewels_to_next - loyaltyData.tier.jewels_to_next) / loyaltyData.tier.jewels_to_next) * 100;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ 
          fontFamily: 'Gilda Display, serif',
          fontWeight: 700,
          color: 'var(--primary-dark)',
          mb: 2
        }}>
          💎 Luxe Jewels Loyalty Program
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Earn jewels with every stay and unlock exclusive benefits
        </Typography>
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
              <Typography variant="body2">Active Jewels</Typography>
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
              <Typography variant="body2">Jewels Earned</Typography>
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
              <Typography variant="body2">Jewels Redeemed</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Star sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {loyaltyData.tier.multiplier}x
              </Typography>
              <Typography variant="body2">Earning Multiplier</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Tier Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ 
                fontFamily: 'Gilda Display, serif',
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
                fontFamily: 'Gilda Display, serif',
                fontWeight: 600,
                color: 'var(--primary-dark)',
                mb: 2
              }}>
                Quick Actions
              </Typography>

              <Button
                variant="contained"
                fullWidth
                startIcon={<Redeem />}
                onClick={() => setRedeemModalOpen(true)}
                disabled={loyaltyData.active_balance < 100}
                sx={{
                  mb: 2,
                  background: 'var(--primary-dark)',
                  '&:hover': { background: 'var(--primary-light)' }
                }}
              >
                Redeem Jewels
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
                fontFamily: 'Gilda Display, serif',
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
                          {transaction.type === 'earned' ? (
                            <TrendingUp sx={{ color: '#10b981' }} />
                          ) : (
                            <Redeem sx={{ color: '#f59e0b' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={transaction.description}
                          secondary={new Date(transaction.date).toLocaleDateString()}
                        />
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: transaction.type === 'earned' ? '#10b981' : '#f59e0b'
                          }}
                        >
                          {transaction.type === 'earned' ? '+' : '-'}{transaction.amount} jewels
                        </Typography>
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

      {/* Redeem Jewels Modal */}
      <RedeemJewelsModal
        open={redeemModalOpen}
        onClose={() => setRedeemModalOpen(false)}
        currentBalance={loyaltyData.active_balance}
        onRedemptionSuccess={handleRedeemSuccess}
      />

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
