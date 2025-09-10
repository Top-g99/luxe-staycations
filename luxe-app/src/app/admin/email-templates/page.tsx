'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Preview,
  Save,
  Cancel,
  Email,
  Visibility,
  VisibilityOff,
  ContentCopy
} from '@mui/icons-material';
import { emailTemplateManager, EmailTemplate, TEMPLATE_VARIABLES } from '@/lib/emailTemplateManager';

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'custom' as EmailTemplate['type'],
    subject: '',
    html: '',
    text: '',
    description: '',
    variables: [] as string[],
    isActive: true
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const allTemplates = emailTemplateManager.getAllTemplates();
    setTemplates(allTemplates);
  };

  const handleOpenDialog = (template?: EmailTemplate) => {
    if (template) {
      setSelectedTemplate(template);
      setFormData({
        name: template.name,
        type: template.type,
        subject: template.subject,
        html: template.html,
        text: template.text,
        description: template.description || '',
        variables: template.variables || [],
        isActive: template.isActive
      });
      setIsEditing(true);
    } else {
      setSelectedTemplate(null);
      setFormData({
        name: '',
        type: 'custom',
        subject: '',
        html: '',
        text: '',
        description: '',
        variables: [],
        isActive: true
      });
      setIsEditing(false);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTemplate(null);
    setFormData({
      name: '',
      type: 'custom',
      subject: '',
      text: '',
      html: '',
      description: '',
      variables: [],
      isActive: true
    });
  };

  const handleSave = () => {
    try {
      if (isEditing && selectedTemplate) {
        emailTemplateManager.updateTemplate(selectedTemplate.id, formData);
        setSnackbar({ open: true, message: 'Template updated successfully!', severity: 'success' });
      } else {
        emailTemplateManager.addTemplate(formData);
        setSnackbar({ open: true, message: 'Template created successfully!', severity: 'success' });
      }
      loadTemplates();
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving template', severity: 'error' });
    }
  };

  const handleDelete = (template: EmailTemplate) => {
    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      try {
        emailTemplateManager.deleteTemplate(template.id);
        setSnackbar({ open: true, message: 'Template deleted successfully!', severity: 'success' });
        loadTemplates();
      } catch (error) {
        setSnackbar({ open: true, message: 'Error deleting template', severity: 'error' });
      }
    }
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleCopyTemplate = (template: EmailTemplate) => {
    setFormData({
      name: `${template.name} (Copy)`,
      type: template.type,
      subject: template.subject,
      html: template.html,
      text: template.text,
      description: template.description || '',
      variables: template.variables || [],
      isActive: true
    });
    setSelectedTemplate(null);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('html-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + variable + after;
      
      setFormData(prev => ({ ...prev, html: newText }));
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const getTemplateTypeColor = (type: EmailTemplate['type']) => {
    const colors = {
      booking_confirmation: 'success',
      booking_cancellation: 'warning',
      payment_confirmation: 'success',
      payment_receipt: 'info',
      payment_refund: 'warning',
      guest_welcome: 'primary',
      guest_checkin: 'info',
      guest_feedback: 'secondary',
      host_booking_alert: 'primary',
      host_earnings: 'success',
      host_management: 'info',
      admin_notification: 'error',
      admin_report: 'error',
      admin_alert: 'error',
      newsletter_welcome: 'primary',
      newsletter_promotion: 'secondary',
      loyalty_program: 'success',
      partner_request: 'info',
      consultation_request: 'primary',
      special_request: 'secondary',
      custom: 'default'
    };
    return colors[type] as any;
  };

  const getTemplateTypeLabel = (type: EmailTemplate['type']) => {
    const labels = {
      booking_confirmation: 'Booking Confirmation',
      booking_cancellation: 'Booking Cancellation',
      payment_confirmation: 'Payment Confirmation',
      payment_receipt: 'Payment Receipt',
      payment_refund: 'Payment Refund',
      guest_welcome: 'Guest Welcome',
      guest_checkin: 'Guest Check-in',
      guest_feedback: 'Guest Feedback',
      host_booking_alert: 'Host Booking Alert',
      host_earnings: 'Host Earnings',
      host_management: 'Host Management',
      admin_notification: 'Admin Notification',
      admin_report: 'Admin Report',
      admin_alert: 'Admin Alert',
      newsletter_welcome: 'Newsletter Welcome',
      newsletter_promotion: 'Newsletter Promotion',
      loyalty_program: 'Loyalty Program',
      partner_request: 'Partner Request',
      consultation_request: 'Consultation Request',
      special_request: 'Special Request',
      custom: 'Custom'
    };
    return labels[type];
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2, color: 'var(--primary-dark)', fontFamily: 'Playfair Display, serif' }}>
          📧 Email Template Manager
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Manage your email templates for all customer communications. Create, edit, and customize templates for different types of emails.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: 'var(--primary-dark)',
              '&:hover': { bgcolor: 'var(--primary-light)' }
            }}
          >
            Create New Template
          </Button>
        </Box>
      </Box>

      {/* Templates Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Email Templates ({templates.length})
          </Typography>
          
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {template.name}
                        </Typography>
                        {template.description && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {template.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTemplateTypeLabel(template.type)}
                        color={getTemplateTypeColor(template.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {template.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={template.isActive ? 'Active' : 'Inactive'}
                        color={template.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(template.updatedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Preview">
                          <IconButton size="small" onClick={() => handlePreview(template)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenDialog(template)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copy">
                          <IconButton size="small" onClick={() => handleCopyTemplate(template)}>
                            <ContentCopy />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(template)} color="error">
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Email color="primary" />
            <Typography variant="h6">
              {isEditing ? 'Edit Template' : 'Create New Template'}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ minHeight: 600 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Template Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Template Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as EmailTemplate['type'] }))}
                  label="Template Type"
                >
                  <optgroup label="Booking Templates">
                    <MenuItem value="booking_confirmation">Booking Confirmation</MenuItem>
                    <MenuItem value="booking_cancellation">Booking Cancellation</MenuItem>
                  </optgroup>
                  <optgroup label="Payment Templates">
                    <MenuItem value="payment_confirmation">Payment Confirmation</MenuItem>
                    <MenuItem value="payment_receipt">Payment Receipt</MenuItem>
                    <MenuItem value="payment_refund">Payment Refund</MenuItem>
                  </optgroup>
                  <optgroup label="Guest Templates">
                    <MenuItem value="guest_welcome">Guest Welcome</MenuItem>
                    <MenuItem value="guest_checkin">Guest Check-in</MenuItem>
                    <MenuItem value="guest_feedback">Guest Feedback</MenuItem>
                  </optgroup>
                  <optgroup label="Host Templates">
                    <MenuItem value="host_booking_alert">Host Booking Alert</MenuItem>
                    <MenuItem value="host_earnings">Host Earnings</MenuItem>
                    <MenuItem value="host_management">Host Management</MenuItem>
                  </optgroup>
                  <optgroup label="Admin Templates">
                    <MenuItem value="admin_notification">Admin Notification</MenuItem>
                    <MenuItem value="admin_report">Admin Report</MenuItem>
                    <MenuItem value="admin_alert">Admin Alert</MenuItem>
                  </optgroup>
                  <optgroup label="Marketing Templates">
                    <MenuItem value="newsletter_welcome">Newsletter Welcome</MenuItem>
                    <MenuItem value="newsletter_promotion">Newsletter Promotion</MenuItem>
                    <MenuItem value="loyalty_program">Loyalty Program</MenuItem>
                  </optgroup>
                  <optgroup label="Request Templates">
                    <MenuItem value="partner_request">Partner Request</MenuItem>
                    <MenuItem value="consultation_request">Consultation Request</MenuItem>
                    <MenuItem value="special_request">Special Request</MenuItem>
                  </optgroup>
                  <optgroup label="Other">
                    <MenuItem value="custom">Custom</MenuItem>
                  </optgroup>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="Active"
              />
            </Grid>
            
            {/* Variables Panel */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Available Variables
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                {Object.entries(TEMPLATE_VARIABLES).map(([variable, info]) => (
                  <Box key={variable} sx={{ mb: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => insertVariable(variable)}
                      sx={{ mb: 0.5, fontSize: '0.75rem' }}
                    >
                      {variable}
                    </Button>
                    <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                      {info.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            
            {/* Subject */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., 🎉 Booking Confirmed - {{propertyName}} | {{companyName}}"
              />
            </Grid>
            
            {/* HTML Content */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                HTML Content
              </Typography>
              <TextField
                id="html-editor"
                fullWidth
                multiline
                rows={12}
                value={formData.html}
                onChange={(e) => setFormData(prev => ({ ...prev, html: e.target.value }))}
                placeholder="Enter HTML content for the email..."
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }
                }}
              />
            </Grid>
            
            {/* Text Content */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Text Content (Fallback)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Enter plain text content for the email..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<Save />}
            sx={{
              bgcolor: 'var(--primary-dark)',
              '&:hover': { bgcolor: 'var(--primary-light)' }
            }}
          >
            {isEditing ? 'Update Template' : 'Create Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Visibility color="primary" />
            <Typography variant="h6">Template Preview</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedTemplate && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedTemplate.name}
              </Typography>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Subject: {selectedTemplate.subject}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 2,
                  maxHeight: 400,
                  overflow: 'auto',
                  bgcolor: '#f8f9fa'
                }}
                dangerouslySetInnerHTML={{ __html: selectedTemplate.html }}
              />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
