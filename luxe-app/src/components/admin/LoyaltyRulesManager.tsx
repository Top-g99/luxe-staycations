'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Diamond as DiamondIcon
} from '@mui/icons-material';

interface LoyaltyRule {
  id: string;
  rule_name: string;
  rule_description: string;
  rule_type: 'spending_to_jewels' | 'bonus_multiplier' | 'expiration_days' | 'minimum_redemption';
  rule_value: number;
  is_active: boolean;
  applies_to: 'all' | 'new_users' | 'existing_users' | 'premium_users';
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

interface RuleFormData {
  rule_name: string;
  rule_description: string;
  rule_type: 'spending_to_jewels' | 'bonus_multiplier' | 'expiration_days' | 'minimum_redemption';
  rule_value: string;
  is_active: boolean;
  applies_to: 'all' | 'new_users' | 'existing_users' | 'premium_users';
  start_date: string;
  end_date: string;
}

export default function LoyaltyRulesManager() {
  const [rules, setRules] = useState<LoyaltyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<LoyaltyRule | null>(null);
  const [formData, setFormData] = useState<RuleFormData>({
    rule_name: '',
    rule_description: '',
    rule_type: 'spending_to_jewels',
    rule_value: '',
    is_active: true,
    applies_to: 'all',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });
  const [saving, setSaving] = useState(false);

  // Load rules on component mount
  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/loyalty/rules');
      const data = await response.json();
      
      if (response.ok) {
        setRules(data.rules || []);
      } else {
        setError(data.error || 'Failed to load rules');
      }
    } catch (error) {
      setError('Failed to load rules');
      console.error('Load rules error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.rule_name || !formData.rule_value) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const url = editingRule 
        ? `/api/admin/loyalty/rules/${editingRule.id}`
        : '/api/admin/loyalty/rules';
      
      const method = editingRule ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rule_value: parseFloat(formData.rule_value)
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setDialogOpen(false);
        setEditingRule(null);
        resetForm();
        loadRules();
      } else {
        setError(data.error || 'Failed to save rule');
      }
    } catch (error) {
      setError('Failed to save rule');
      console.error('Save rule error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (rule: LoyaltyRule) => {
    setEditingRule(rule);
    setFormData({
      rule_name: rule.rule_name,
      rule_description: rule.rule_description || '',
      rule_type: rule.rule_type,
      rule_value: rule.rule_value.toString(),
      is_active: rule.is_active,
      applies_to: rule.applies_to,
      start_date: rule.start_date.split('T')[0],
      end_date: rule.end_date ? rule.end_date.split('T')[0] : ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const response = await fetch(`/api/admin/loyalty/rules/${ruleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadRules();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete rule');
      }
    } catch (error) {
      setError('Failed to delete rule');
      console.error('Delete rule error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      rule_name: '',
      rule_description: '',
      rule_type: 'spending_to_jewels',
      rule_value: '',
      is_active: true,
      applies_to: 'all',
      start_date: new Date().toISOString().split('T')[0],
      end_date: ''
    });
  };

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'spending_to_jewels': return 'primary';
      case 'bonus_multiplier': return 'success';
      case 'expiration_days': return 'warning';
      case 'minimum_redemption': return 'error';
      default: return 'default';
    }
  };

  const getAppliesToColor = (appliesTo: string) => {
    switch (appliesTo) {
      case 'all': return 'default';
      case 'new_users': return 'success';
      case 'existing_users': return 'info';
      case 'premium_users': return 'warning';
      default: return 'default';
    }
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
        ⚙️ Loyalty Rules Management
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Configure how guests earn jewels based on spending, bonuses, and other criteria.
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #5a3d35, #d97706)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <DiamondIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {rules.filter(r => r.rule_type === 'spending_to_jewels').length}
                  </Typography>
                  <Typography variant="body2">Spending Rules</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #5a3d35, #d97706)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {rules.filter(r => r.rule_type === 'bonus_multiplier').length}
                  </Typography>
                  <Typography variant="body2">Bonus Rules</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #5a3d35, #d97706)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SettingsIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {rules.filter(r => r.is_active).length}
                  </Typography>
                  <Typography variant="body2">Active Rules</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #5a3d35, #d97706)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {rules.length}
                  </Typography>
                  <Typography variant="body2">Total Rules</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Loyalty Rules Configuration
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingRule(null);
            resetForm();
            setDialogOpen(true);
          }}
          sx={{
            background: 'linear-gradient(45deg, #5a3d35, #d97706)',
            '&:hover': { background: 'linear-gradient(45deg, #4a332c, #b45309)' }
          }}
        >
          Add New Rule
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Rules Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rule Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Applies To</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {rule.rule_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {rule.rule_description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rule.rule_type.replace('_', ' ')}
                        color={getRuleTypeColor(rule.rule_type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {rule.rule_type === 'spending_to_jewels' && '₹'}
                        {rule.rule_value}
                        {rule.rule_type === 'spending_to_jewels' && ' per ₹100'}
                        {rule.rule_type === 'bonus_multiplier' && 'x'}
                        {rule.rule_type === 'expiration_days' && ' days'}
                        {rule.rule_type === 'minimum_redemption' && ' jewels'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rule.applies_to.replace('_', ' ')}
                        color={getAppliesToColor(rule.applies_to) as any}
                        size="small"
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
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit Rule">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(rule)}
                            sx={{ color: '#d97706' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Rule">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(rule.id)}
                            sx={{ color: '#ef4444' }}
                          >
                            <DeleteIcon />
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

      {/* Add/Edit Rule Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRule ? 'Edit Loyalty Rule' : 'Add New Loyalty Rule'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Rule Name"
                  placeholder="e.g., spending_to_jewels"
                  fullWidth
                  value={formData.rule_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, rule_name: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Rule Type</InputLabel>
                  <Select
                    value={formData.rule_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, rule_type: e.target.value as any }))}
                    label="Rule Type"
                  >
                    <MenuItem value="spending_to_jewels">Spending to Jewels</MenuItem>
                    <MenuItem value="bonus_multiplier">Bonus Multiplier</MenuItem>
                    <MenuItem value="expiration_days">Expiration Days</MenuItem>
                    <MenuItem value="minimum_redemption">Minimum Redemption</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              label="Rule Description"
              placeholder="Describe what this rule does..."
              fullWidth
              multiline
              rows={2}
              value={formData.rule_description}
              onChange={(e) => setFormData(prev => ({ ...prev, rule_description: e.target.value }))}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Rule Value"
                  placeholder={formData.rule_type === 'spending_to_jewels' ? '1.00' : '1.50'}
                  fullWidth
                  type="number"
                  inputProps={{ step: 0.01 }}
                  value={formData.rule_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, rule_value: e.target.value }))}
                  required
                  helperText={
                    formData.rule_type === 'spending_to_jewels' ? 'Jewels per ₹100 spent' :
                    formData.rule_type === 'bonus_multiplier' ? 'Multiplier value (e.g., 1.5x)' :
                    formData.rule_type === 'expiration_days' ? 'Days before expiration' :
                    'Minimum jewels required'
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Applies To</InputLabel>
                  <Select
                    value={formData.applies_to}
                    onChange={(e) => setFormData(prev => ({ ...prev, applies_to: e.target.value as any }))}
                    label="Applies To"
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="new_users">New Users Only</MenuItem>
                    <MenuItem value="existing_users">Existing Users Only</MenuItem>
                    <MenuItem value="premium_users">Premium Users Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="End Date (Optional)"
                  type="date"
                  fullWidth
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  helperText="Leave empty for no expiration"
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
              }
              label="Rule is Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={saving || !formData.rule_name || !formData.rule_value}
            sx={{
              background: 'linear-gradient(45deg, #5a3d35, #d97706)',
              '&:hover': { background: 'linear-gradient(45deg, #4a332c, #b45309)' }
            }}
          >
            {saving ? <CircularProgress size={20} /> : (editingRule ? 'Update Rule' : 'Create Rule')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
