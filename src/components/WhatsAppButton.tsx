"use client";

import React, { useState } from 'react';
import {
  Fab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import {
  WhatsApp,
  Close,
  Send
} from '@mui/icons-material';
import { whatsappService } from '@/lib/whatsappService';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  variant?: 'floating' | 'inline';
  size?: 'small' | 'medium' | 'large';
  position?: {
    bottom?: number;
    right?: number;
    left?: number;
    top?: number;
  };
}

export default function WhatsAppButton({
  phoneNumber = '+91-8828279739',
  message = 'Hello! I would like to know more about your luxury villas.',
  variant = 'floating',
  size = 'large',
  position = { bottom: 20, right: 20 }
}: WhatsAppButtonProps) {
  const [open, setOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState(message);
  const [customPhone, setCustomPhone] = useState(phoneNumber);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleClick = () => {
    if (variant === 'floating') {
      // Direct WhatsApp link
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      setOpen(true);
    }
  };

  const handleSendMessage = async () => {
    if (!customPhone.trim()) {
      setAlert({
        open: true,
        message: 'Please enter a phone number',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      // Try to send via WhatsApp service if configured
      await whatsappService.initialize();
      if (whatsappService.isServiceConfigured()) {
        const result = await whatsappService.sendQuickResponse(customPhone, customMessage);
        setAlert({
          open: true,
          message: result.message || 'Operation completed',
          severity: result.success ? 'success' : 'error'
        });
      } else {
        // Fallback to direct WhatsApp link
        const cleanPhone = customPhone.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`;
        window.open(whatsappUrl, '_blank');
        setAlert({
          open: true,
          message: 'Opening WhatsApp...',
          severity: 'info'
        });
      }
      setOpen(false);
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      setAlert({
        open: true,
        message: 'Error sending message',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  const getFabSize = () => {
    switch (size) {
      case 'small': return 'small';
      case 'medium': return 'medium';
      case 'large': return 'large';
      default: return 'large';
    }
  };

  const getFabSx = () => {
    const baseSx = {
      backgroundColor: '#25D366',
      color: 'white',
      '&:hover': {
        backgroundColor: '#1ea952',
      },
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
    };

    if (variant === 'floating') {
      return {
        ...baseSx,
        position: 'fixed',
        zIndex: 1000,
        ...position
      };
    }

    return baseSx;
  };

  return (
    <>
      <Tooltip title="Chat with us on WhatsApp" arrow>
        <Fab
          size={getFabSize()}
          onClick={() => handleClick()}
          sx={getFabSx()}
        >
          <WhatsApp />
        </Fab>
      </Tooltip>

      {/* WhatsApp Message Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WhatsApp sx={{ color: '#25D366' }} />
            <Typography variant="h6">Send WhatsApp Message</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Phone Number"
              value={customPhone}
              onChange={(e) => setCustomPhone(e.target.value)}
              placeholder="+91-9876543210"
              sx={{ mb: 2 }}
              helperText="Include country code (e.g., +91 for India)"
            />
            
            <TextField
              fullWidth
              label="Message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              multiline
              rows={4}
              placeholder="Type your message here..."
              helperText="This message will be sent via WhatsApp"
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpen(false)} startIcon={<Close />}>
            Cancel
          </Button>
          <Button
            onClick={() => handleSendMessage()}
            variant="contained"
            startIcon={<Send />}
            disabled={loading}
            sx={{
              backgroundColor: '#25D366',
              '&:hover': {
                backgroundColor: '#1ea952',
              }
            }}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
}
