'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Chip
} from '@mui/material';
import {
  CreditCard,
  AccountBalance,
  Payment,
  Lock,
  Security,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { razorpayService } from '@/lib/razorpayService';

interface PaymentFormProps {
  totalAmount: number;
  onPaymentSuccess: (paymentDetails: any) => void;
  onPaymentError: (error: string) => void;
  bookingData?: {
    bookingId: string;
    guestName: string;
    propertyName: string;
    guestEmail: string;
    guestPhone: string;
  };
}

export default function PaymentForm({ totalAmount, onPaymentSuccess, onPaymentError, bookingData }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState('card'); // Changed from 'razorpay' to 'card' for testing
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const [upiDetails, setUpiDetails] = useState({
    upiId: ''
  });
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    accountHolder: ''
  });
  const [loading, setLoading] = useState(false);
  const [isRazorpayConfigured, setIsRazorpayConfigured] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

  // Check Razorpay configuration on component mount
  useEffect(() => {
    const checkRazorpayConfig = () => {
      // Temporarily disable Razorpay for testing
      const isConfigured = false; // razorpayService.isRazorpayConfigured();
      setIsRazorpayConfigured(isConfigured);
      
      // Don't show error for now, just use fallback methods
      // if (!isConfigured) {
      //   onPaymentError('Razorpay is not configured. Please contact administrator.');
      // }
    };

    checkRazorpayConfig();

    // Listen for payment success events
    const handlePaymentSuccess = (event: CustomEvent) => {
      const paymentDetails = event.detail;
      onPaymentSuccess(paymentDetails);
    };

    const handlePaymentCancelled = (event: CustomEvent) => {
      onPaymentError('Payment was cancelled by user.');
    };

    window.addEventListener('razorpay-payment-success', handlePaymentSuccess as EventListener);
    window.addEventListener('razorpay-payment-cancelled', handlePaymentCancelled as EventListener);

    return () => {
      window.removeEventListener('razorpay-payment-success', handlePaymentSuccess as EventListener);
      window.removeEventListener('razorpay-payment-cancelled', handlePaymentCancelled as EventListener);
    };
  }, [onPaymentSuccess, onPaymentError]);

  const handleCardChange = (field: string, value: string) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpiChange = (field: string, value: string) => {
    setUpiDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBankChange = (field: string, value: string) => {
    setBankDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateCardDetails = () => {
    if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 16) {
      return 'Please enter a valid card number';
    }
    if (!cardDetails.cardHolder) {
      return 'Please enter card holder name';
    }
    if (!cardDetails.expiryMonth || !cardDetails.expiryYear) {
      return 'Please select expiry date';
    }
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      return 'Please enter a valid CVV';
    }
    return null;
  };

  const validateUpiDetails = () => {
    if (!upiDetails.upiId || !upiDetails.upiId.includes('@')) {
      return 'Please enter a valid UPI ID';
    }
    return null;
  };

  const validateBankDetails = () => {
    if (!bankDetails.accountNumber || bankDetails.accountNumber.length < 10) {
      return 'Please enter a valid account number';
    }
    if (!bankDetails.ifscCode || bankDetails.ifscCode.length < 4) {
      return 'Please enter a valid IFSC code';
    }
    if (!bankDetails.accountHolder) {
      return 'Please enter account holder name';
    }
    return null;
  };

  const handlePaymentSubmit = async () => {
    setLoading(true);

    try {
      if (paymentMethod === 'razorpay') {
        if (!isRazorpayConfigured) {
          onPaymentError('Razorpay is not configured. Please contact administrator.');
          setLoading(false);
          return;
        }

        if (!bookingData) {
          onPaymentError('Booking data is required for payment.');
          setLoading(false);
          return;
        }

        // Initialize Razorpay payment
        const result = await razorpayService.initializePayment({
          amount: totalAmount,
          currency: 'INR',
          name: 'Luxe Staycations',
          description: `Booking for ${bookingData.propertyName}`,
          orderId: bookingData.bookingId || `order_${Date.now()}`,
          customerName: bookingData.guestName,
          customerEmail: bookingData.guestEmail,
          customerPhone: bookingData.guestPhone,
          customerAddress: ''
        });

        if (!result) {
          onPaymentError('Failed to initialize payment');
        }
        // Payment success will be handled by the event listener
        setLoading(false);
        return;
      }

      // Fallback to manual payment methods
      let validationError = null;

      switch (paymentMethod) {
        case 'card':
          validationError = validateCardDetails();
          break;
        case 'upi':
          validationError = validateUpiDetails();
          break;
        case 'bank':
          validationError = validateBankDetails();
          break;
        default:
          validationError = 'Please select a payment method';
      }

      if (validationError) {
        onPaymentError(validationError);
        setLoading(false);
        return;
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate payment details
      const paymentDetails = {
        method: paymentMethod,
        amount: totalAmount,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'success',
        timestamp: new Date().toISOString(),
        details: paymentMethod === 'card' ? cardDetails : 
                paymentMethod === 'upi' ? upiDetails : bankDetails
      };

      onPaymentSuccess(paymentDetails);
    } catch (error) {
      onPaymentError('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#5a3d35' }}>
        Payment Information
      </Typography>
      
      {/* Test Mode Notice */}
      <Alert severity="info" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircle />
        Test Mode: Using manual payment methods for testing. Razorpay temporarily disabled.
      </Alert>

      {/* Razorpay Status - Temporarily Hidden for Testing */}
      {/* {!isRazorpayConfigured && (
        <Alert severity="warning" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Error />
          Razorpay payment gateway is not configured. Please contact administrator.
        </Alert>
      )} */}

      {/* Payment Method Selection */}
      <Card sx={{ mb: 3, border: '2px solid #f3f4f6' }}>
        <CardContent>
          <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600, color: '#d97706' }}>
            Select Payment Method
          </FormLabel>
          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            {/* Razorpay temporarily disabled for testing */}
            {/* <FormControlLabel
              value="razorpay"
              control={<Radio />}
              disabled={!isRazorpayConfigured}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Payment />
                  <Typography>Razorpay (Recommended)</Typography>
                  {isRazorpayConfigured && (
                    <Chip
                      icon={<CheckCircle />}
                      label="Secure"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              }
            /> */}
            <FormControlLabel
              value="card"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CreditCard />
                  <Typography>Credit/Debit Card (Recommended)</Typography>
                  <Chip
                    icon={<CheckCircle />}
                    label="Secure"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>
              }
            />
            <FormControlLabel
              value="upi"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Payment />
                  <Typography>UPI Payment (Manual)</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="bank"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalance />
                  <Typography>Net Banking (Manual)</Typography>
                </Box>
              }
            />
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Payment Forms */}
      {paymentMethod === 'card' && (
        <Card sx={{ mb: 3, border: '2px solid #f3f4f6' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CreditCard />
              Card Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  value={cardDetails.cardNumber}
                  onChange={(e) => handleCardChange('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                  inputProps={{ maxLength: 16 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Holder Name"
                  value={cardDetails.cardHolder}
                  onChange={(e) => handleCardChange('cardHolder', e.target.value)}
                  placeholder="JOHN DOE"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Expiry Month</InputLabel>
                  <Select
                    value={cardDetails.expiryMonth}
                    onChange={(e) => handleCardChange('expiryMonth', e.target.value)}
                    label="Expiry Month"
                  >
                    {months.map((month) => (
                      <MenuItem key={month} value={month}>{month}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Expiry Year</InputLabel>
                  <Select
                    value={cardDetails.expiryYear}
                    onChange={(e) => handleCardChange('expiryYear', e.target.value)}
                    label="Expiry Year"
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="CVV"
                  value={cardDetails.cvv}
                  onChange={(e) => handleCardChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  inputProps={{ maxLength: 4 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {paymentMethod === 'upi' && (
        <Card sx={{ mb: 3, border: '2px solid #f3f4f6' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Payment />
              UPI Payment
            </Typography>
            
            <TextField
              fullWidth
              label="UPI ID"
              value={upiDetails.upiId}
              onChange={(e) => handleUpiChange('upiId', e.target.value)}
              placeholder="username@upi"
              helperText="Enter your UPI ID (e.g., john@okicici)"
            />
          </CardContent>
        </Card>
      )}

      {paymentMethod === 'bank' && (
        <Card sx={{ mb: 3, border: '2px solid #f3f4f6' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalance />
              Net Banking
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Account Number"
                  value={bankDetails.accountNumber}
                  onChange={(e) => handleBankChange('accountNumber', e.target.value.replace(/\D/g, ''))}
                  placeholder="1234567890"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="IFSC Code"
                  value={bankDetails.ifscCode}
                  onChange={(e) => handleBankChange('ifscCode', e.target.value.toUpperCase())}
                  placeholder="SBIN0001234"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Account Holder Name"
                  value={bankDetails.accountHolder}
                  onChange={(e) => handleBankChange('accountHolder', e.target.value)}
                  placeholder="JOHN DOE"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Alert severity="info" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Security />
        Your payment information is secure and encrypted. We use industry-standard SSL encryption.
      </Alert>

      {/* Payment Button */}
      <Button
        fullWidth
        variant="contained"
        onClick={handlePaymentSubmit}
        disabled={loading}
        sx={{
          py: 2,
          background: 'linear-gradient(45deg, #5a3d35, #d97706)',
          '&:hover': {
            background: 'linear-gradient(45deg, #4a332c, #b45309)',
          }
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lock />
            Processing Payment...
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Payment />
            Pay ₹{totalAmount.toLocaleString()}
          </Box>
        )}
      </Button>
    </Box>
  );
}
