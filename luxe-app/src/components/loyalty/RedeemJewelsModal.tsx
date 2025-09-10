"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Slider,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Diamond,
  Redeem,
  Info
} from '@mui/icons-material';

interface RedeemJewelsModalProps {
  open: boolean;
  onClose: () => void;
  currentBalance: number;
  onRedemptionSuccess: (discountAmount: number, jewelsRedeemed: number) => void;
}

const RedeemJewelsModal: React.FC<RedeemJewelsModalProps> = ({
  open,
  onClose,
  currentBalance,
  onRedemptionSuccess
}) => {
  const [jewelsToRedeem, setJewelsToRedeem] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setJewelsToRedeem(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      setJewelsToRedeem(Math.min(Math.max(value, 100), currentBalance));
    }
  };

  const handleQuickSelect = (amount: number) => {
    setJewelsToRedeem(Math.min(amount, currentBalance));
  };

  const handleRedeem = async () => {
    if (jewelsToRedeem < 100) {
      setError('Minimum redemption amount is 100 jewels');
      return;
    }

    if (jewelsToRedeem > currentBalance) {
      setError('You don\'t have enough jewels for this redemption');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 1 jewel = 1 rupee discount
      const discountAmount = jewelsToRedeem;
      
      onRedemptionSuccess(discountAmount, jewelsToRedeem);
    } catch (err) {
      setError('Failed to redeem jewels. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidRedemption = jewelsToRedeem >= 100 && jewelsToRedeem <= currentBalance;
  const isMinimumRedemption = jewelsToRedeem >= 100;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        fontFamily: 'Playfair Display, serif',
        fontWeight: 600
      }}>
        <Diamond sx={{ color: 'var(--primary-light)' }} />
        Redeem Luxe Jewels
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Convert your jewels into instant discounts on your next booking.
          </Typography>

          <Card sx={{ 
            background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
            color: 'white',
            mb: 3
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Diamond sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {currentBalance.toLocaleString()}
              </Typography>
              <Typography variant="body2">Available Jewels</Typography>
            </CardContent>
          </Card>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Select Jewels to Redeem
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Minimum redemption: 100 jewels
          </Typography>

          <TextField
            fullWidth
            label="Jewels to Redeem"
            type="number"
            value={jewelsToRedeem}
            onChange={handleInputChange}
            inputProps={{
              min: 100,
              max: currentBalance,
              step: 10
            }}
            sx={{ mb: 2 }}
          />

          <Slider
            value={jewelsToRedeem}
            onChange={handleSliderChange}
            min={100}
            max={currentBalance}
            step={10}
            valueLabelDisplay="auto"
            sx={{ mb: 3 }}
          />

          <Typography variant="body2" sx={{ mb: 2 }}>
            Quick Select:
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            {[100, 250, 500, 1000].map((amount) => (
              <Chip
                key={amount}
                label={`${amount} Jewels`}
                onClick={() => handleQuickSelect(amount)}
                variant={jewelsToRedeem === amount ? 'filled' : 'outlined'}
                color={jewelsToRedeem === amount ? 'primary' : 'default'}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>

          <Card sx={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            color: 'white',
            mb: 2
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Redeem />
                Discount Value
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ₹{jewelsToRedeem}
              </Typography>
              <Typography variant="body2">
                Jewels to Redeem
              </Typography>
            </CardContent>
          </Card>

          {!isMinimumRedemption && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Minimum redemption amount is 100 jewels
            </Alert>
          )}

          {jewelsToRedeem > currentBalance && (
            <Alert severity="error" sx={{ mb: 2 }}>
              You don't have enough jewels for this redemption
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Alert severity="info" icon={<Info />}>
            <Typography variant="body2">
              <strong>How it works:</strong> 1 Jewel = ₹1 discount. 
              Redeemed jewels will be applied as instant discount on your next booking.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleRedeem}
          disabled={!isValidRedemption || isLoading}
          startIcon={<Redeem />}
          sx={{
            background: 'var(--primary-dark)',
            '&:hover': { background: 'var(--primary-light)' }
          }}
        >
          {isLoading ? 'Redeeming...' : `Redeem ${jewelsToRedeem}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RedeemJewelsModal;
