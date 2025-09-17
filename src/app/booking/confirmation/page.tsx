'use client';

import React, { useEffect, useState, Suspense } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { CheckCircle, Email, WhatsApp } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { emailService } from '@/lib/emailService';
import { emailTriggerManager } from '@/lib/emailTriggerManager';
import { whatsappService } from '@/lib/whatsappService';
import WhatsAppButton from '@/components/WhatsAppButton';

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [emailStatus, setEmailStatus] = useState<'sending' | 'sent' | 'error' | null>(null);
  const [emailMessage, setEmailMessage] = useState('');
  const [whatsappStatus, setWhatsappStatus] = useState<'sending' | 'sent' | 'error' | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState('');

  // Get booking data from URL params or localStorage
  const bookingData = {
    guestName: searchParams.get('guestName') || 'Guest',
    guestEmail: searchParams.get('guestEmail') || '',
    bookingId: searchParams.get('bookingId') || 'LS-' + Date.now(),
    propertyName: searchParams.get('propertyName') || 'Luxury Villa',
    propertyAddress: searchParams.get('propertyAddress') || 'Premium Location',
    propertyLocation: searchParams.get('propertyLocation') || 'Premium Location',
    checkIn: searchParams.get('checkIn') || new Date().toLocaleDateString(),
    checkOut: searchParams.get('checkOut') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    guests: searchParams.get('guests') || '2',
    totalAmount: parseFloat(searchParams.get('totalAmount') || '0'),
    hostName: searchParams.get('hostName') || 'Property Host',
    hostPhone: searchParams.get('hostPhone') || '+91-8828279739',
    hostEmail: searchParams.get('hostEmail') || 'host@luxestaycations.in',
    specialRequests: searchParams.get('specialRequests') || '',
    amenities: searchParams.get('amenities')?.split(',') || [],
    transactionId: searchParams.get('transactionId') || 'TXN-' + Date.now(),
    paymentMethod: searchParams.get('paymentMethod') || 'Online Payment'
  };

  useEffect(() => {
    // Initialize email service and send confirmation email
    const initializeAndSendEmail = async () => {
      if (bookingData.guestEmail) {
        try {
          await emailService.initialize();
          if (emailService.isConfigured) {
            sendConfirmationEmail();
          } else {
            console.log('Email service not configured, skipping email send');
            setEmailStatus('error');
            setEmailMessage('Email service not configured. Please configure email settings in admin panel.');
          }
        } catch (error) {
          console.error('Error initializing email service:', error);
          setEmailStatus('error');
          setEmailMessage('Failed to initialize email service');
        }
      }
    };

    initializeAndSendEmail();
    
    // Send WhatsApp confirmation if phone number is available
    const guestPhone = searchParams.get('guestPhone');
    if (guestPhone && whatsappService.isConfigured) {
      sendWhatsAppConfirmation(guestPhone);
    }
  }, []);

  const sendConfirmationEmail = async () => {
    if (!bookingData.guestEmail) return;
    
    setEmailStatus('sending');
    try {
      // Use email trigger manager for better template handling
      const result = await emailTriggerManager.triggerBookingConfirmation(bookingData);
      if (result.success) {
        setEmailStatus('sent');
        setEmailMessage('Confirmation email sent successfully!');
      } else {
        setEmailStatus('error');
        setEmailMessage(result.message || 'Email sending failed');
      }
    } catch (error) {
      setEmailStatus('error');
      setEmailMessage('Failed to send confirmation email');
    }
  };

  const sendWhatsAppConfirmation = async (phoneNumber: string) => {
    setWhatsappStatus('sending');
    
    try {
      await whatsappService.initialize();
      const result = await whatsappService.sendBookingConfirmation({
        guestName: bookingData.guestName,
        guestPhone: phoneNumber,
        bookingId: bookingData.bookingId,
        propertyName: bookingData.propertyName,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        totalAmount: bookingData.totalAmount,
        confirmationCode: bookingData.bookingId
      });

      if (result.success) {
        setWhatsappStatus('sent');
        setWhatsappMessage('WhatsApp confirmation sent successfully!');
      } else {
        setWhatsappStatus('error');
        setWhatsappMessage(result.message || 'WhatsApp sending failed');
      }
    } catch (error) {
      console.error('Error sending WhatsApp confirmation:', error);
      setWhatsappStatus('error');
      setWhatsappMessage('Failed to send WhatsApp confirmation');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
        <Typography variant="h3" sx={{ mb: 2, color: 'var(--primary-dark)' }}>
          Booking Confirmed!
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4 }}>
          Thank you for choosing Luxe Staycations
        </Typography>
      </Box>

      {/* Email Status */}
      {emailStatus && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Email color="primary" />
              <Typography variant="h6">Email Confirmation</Typography>
            </Box>
            
            {emailStatus === 'sending' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Sending confirmation email...</Typography>
              </Box>
            )}
            
            {emailStatus === 'sent' && (
              <Alert severity="success" sx={{ mb: 2 }}>
                ✅ Confirmation email sent successfully to {bookingData.guestEmail}
              </Alert>
            )}
            
            {emailStatus === 'error' && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                ⚠️ {emailMessage}
                <Button 
                  size="small" 
                  onClick={sendConfirmationEmail}
                  sx={{ ml: 2 }}
                >
                  Retry
                </Button>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* WhatsApp Status */}
      {whatsappStatus && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <WhatsApp sx={{ color: '#25D366' }} />
              <Typography variant="h6">WhatsApp Confirmation</Typography>
            </Box>
            
            {whatsappStatus === 'sending' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Sending WhatsApp confirmation...</Typography>
              </Box>
            )}
            
            {whatsappStatus === 'sent' && (
              <Alert severity="success" sx={{ mb: 2 }}>
                ✅ WhatsApp confirmation sent successfully!
              </Alert>
            )}
            
            {whatsappStatus === 'error' && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                ⚠️ {whatsappMessage}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            What's Next?
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            • {emailStatus === 'sent' ? 'Confirmation email sent to your inbox' : 'You will receive a confirmation email shortly'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            • Our team will contact you to confirm your stay details
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            • You can manage your booking through the guest portal
          </Typography>
          <Typography variant="body1">
            • For any questions, please contact our support team
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => router.push('/villas')}
          sx={{ 
            bgcolor: 'var(--primary-dark)',
            '&:hover': { bgcolor: 'var(--primary-dark)' }
          }}
        >
          Browse More Properties
        </Button>
        <Button
          variant="outlined"
          onClick={() => router.push('/')}
        >
          Return Home
        </Button>
      </Box>

      {/* WhatsApp Button */}
      <WhatsAppButton
        phoneNumber={bookingData.hostPhone}
        message={`Hello! I have a booking confirmation for ${bookingData.propertyName}. Booking ID: ${bookingData.bookingId}. Please assist me with any questions.`}
        variant="floating"
        size="large"
        position={{ bottom: 20, right: 20 }}
      />
    </Container>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
