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
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Diamond,
  Edit,
  Save,
  Add,
  Delete,
  Settings,
  TrendingUp,
  Redeem,
  Star,
  CardGiftcard,
  Schedule
} from '@mui/icons-material';

interface LoyaltyRule {
  id: string;
  rule_name: string;
  rule_description: string;
  rule_type: 'earning' | 'redemption' | 'tier' | 'bonus' | 'expiry';
  rule_value: number;
  rule_unit: string;
  applies_to: string;
  min_value: number;
  max_value: number | null;
  is_active: boolean;
  priority: number;
  effective_from: string;
  effective_until: string | null;
  created_at: string;
  updated_at: string;
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
      id={`loyalty-rules-tabpanel-${index}`}
      aria-labelledby={`loyalty-rules-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function LoyaltyRulesManager() {
  const [loyaltyRules, setLoyaltyRules] = useState<LoyaltyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [setupMessage, setSetupMessage] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedRule, setSelectedRule] = useState<LoyaltyRule | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<LoyaltyRule>>({});
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadLoyaltyRules();
  }, []);

  const loadLoyaltyRules = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/loyalty/rules');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch loyalty rules');
      }

      setLoyaltyRules(result.data || []);
      
      if (result.setup_required) {
        setSetupRequired(true);
        setSetupMessage(result.message || 'Database setup required');
        setAlert({
          open: true,
          message: result.message || 'Loyalty rules system is being set up',
          severity: 'info'
        });
      } else {
        setSetupRequired(false);
        setSetupMessage('');
      }
    } catch (error) {
      console.error('Error loading loyalty rules:', error);
      setAlert({
        open: true,
        message: 'Failed to load loyalty rules',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getFilteredRules = () => {
    const ruleTypes = ['earning', 'redemption', 'tier', 'bonus', 'expiry'];
    if (tabValue === 0) return loyaltyRules;
    return loyaltyRules.filter(rule => rule.rule_type === ruleTypes[tabValue - 1]);
  };

  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case 'earning': return <TrendingUp sx={{ color: '#10b981' }} />;
      case 'redemption': return <Redeem sx={{ color: '#f59e0b' }} />;
      case 'tier': return <Star sx={{ color: '#8b5cf6' }} />;
      case 'bonus': return <CardGiftcard sx={{ color: '#ef4444' }} />;
      case 'expiry': return <Schedule sx={{ color: '#6b7280' }} />;
      default: return <Settings sx={{ color: '#6b7280' }} />;
    }
  };

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'earning': return 'success';
      case 'redemption': return 'warning';
      case 'tier': return 'primary';
      case 'bonus': return 'error';
      case 'expiry': return 'default';
      default: return 'default';
    }
  };

  const formatValue = (rule: LoyaltyRule) => {
    if (rule.rule_unit === 'percentage') {
      return `${rule.rule_value}%`;
    } else if (rule.rule_unit === 'multiplier') {
      return `${rule.rule_value}x`;
    } else if (rule.rule_unit === 'days') {
      return `${rule.rule_value} days`;
    } else if (rule.rule_unit === 'jewels') {
      return `${rule.rule_value} jewels`;
    } else {
      return `₹${rule.rule_value}`;
    }
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

  const filteredRules = getFilteredRules();

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
          💎 Loyalty Rules Management
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Configure and manage loyalty program rules and rates
        </Typography>
      </Box>

      {/* Setup Required Warning */}
      {setupRequired && (
        <Box sx={{ mb: 4, p: 3, backgroundColor: '#fff3cd', borderRadius: 2, border: '1px solid #ffeaa7' }}>
          <Typography variant="h6" sx={{ color: '#856404', fontWeight: 600, mb: 2 }}>
            ⚠️ Database Setup Required
          </Typography>
          <Typography variant="body1" sx={{ color: '#856404', mb: 2 }}>
            {setupMessage}
          </Typography>
          <Box sx={{ backgroundColor: '#f8f9fa', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
            <Typography variant="body2" sx={{ color: '#856404' }}>
              <strong>Run this SQL command:</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: '#856404', mt: 1 }}>
              psql -d your_database_name -f loyalty-rules-schema.sql
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#856404', mt: 2, fontSize: '0.875rem' }}>
            📍 File location: <code>/Users/ishaankhan/Desktop/Luxe/luxe/loyalty-rules-schema.sql</code>
          </Typography>
        </Box>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {loyaltyRules.filter(r => r.rule_type === 'earning').length}
              </Typography>
              <Typography variant="body2">Earning Rules</Typography>
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
                {loyaltyRules.filter(r => r.rule_type === 'redemption').length}
              </Typography>
              <Typography variant="body2">Redemption Rules</Typography>
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
                {loyaltyRules.filter(r => r.rule_type === 'tier').length}
              </Typography>
              <Typography variant="body2">Tier Rules</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CardGiftcard sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {loyaltyRules.filter(r => r.rule_type === 'bonus').length}
              </Typography>
              <Typography variant="body2">Bonus Rules</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="loyalty rules tabs">
              <Tab label="All Rules" icon={<Settings />} iconPosition="start" />
              <Tab label="Earning" icon={<TrendingUp />} iconPosition="start" />
              <Tab label="Redemption" icon={<Redeem />} iconPosition="start" />
              <Tab label="Tiers" icon={<Star />} iconPosition="start" />
              <Tab label="Bonuses" icon={<CardGiftcard />} iconPosition="start" />
              <Tab label="Expiry" icon={<Schedule />} iconPosition="start" />
            </Tabs>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddModalOpen(true)}
              sx={{
                mr: 2,
                background: 'var(--primary-dark)',
                '&:hover': { background: 'var(--primary-light)' }
              }}
            >
              Add New Rule
            </Button>
          </Box>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6">All Loyalty Rules</Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6">Earning Rules</Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6">Redemption Rules</Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6">Tier Rules</Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6">Bonus Rules</Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6">Expiry Rules</Typography>
        </TabPanel>

        {/* Rules Table */}
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Rule</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Applies To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRules.map((rule) => (
                <TableRow key={rule.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {rule.rule_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {rule.rule_description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={getRuleTypeIcon(rule.rule_type)}
                      label={rule.rule_type} 
                      color={getRuleTypeColor(rule.rule_type) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatValue(rule)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {rule.rule_unit}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={rule.applies_to} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={rule.is_active ? 'Active' : 'Inactive'} 
                      color={rule.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {rule.priority}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit Rule">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedRule(rule);
                            setEditingRule({
                              rule_name: rule.rule_name,
                              rule_description: rule.rule_description,
                              rule_type: rule.rule_type,
                              rule_value: rule.rule_value,
                              rule_unit: rule.rule_unit,
                              applies_to: rule.applies_to,
                              min_value: rule.min_value,
                              max_value: rule.max_value,
                              priority: rule.priority,
                              is_active: rule.is_active
                            });
                            setEditModalOpen(true);
                          }}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredRules.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            {setupRequired ? (
              <Box>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                  No Loyalty Rules Available
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  The loyalty rules system needs to be set up first. Once you run the database schema, 
                  you'll see all the default rules here.
                </Typography>
                <Box sx={{ backgroundColor: '#f8f9fa', p: 2, borderRadius: 1, fontFamily: 'monospace', display: 'inline-block' }}>
                  <Typography variant="body2" sx={{ color: '#856404' }}>
                    psql -d your_database_name -f loyalty-rules-schema.sql
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No {tabValue === 0 ? '' : tabValue === 1 ? 'earning' : tabValue === 2 ? 'redemption' : tabValue === 3 ? 'tier' : tabValue === 4 ? 'bonus' : 'expiry'} loyalty rules found.
              </Typography>
            )}
          </Box>
        )}
      </Card>

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
