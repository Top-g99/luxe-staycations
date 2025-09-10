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
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Pagination,
  Stack,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  Diamond as DiamondIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

// Dynamic import for charts to handle potential loading issues
let LineChart: any, Line: any, XAxis: any, YAxis: any, CartesianGrid: any, RechartsTooltip: any, ResponsiveContainer: any;

try {
  const recharts = require('recharts');
  LineChart = recharts.LineChart;
  Line = recharts.Line;
  XAxis = recharts.XAxis;
  YAxis = recharts.YAxis;
  CartesianGrid = recharts.CartesianGrid;
  RechartsTooltip = recharts.Tooltip;
  ResponsiveContainer = recharts.ResponsiveContainer;
} catch (error) {
  console.warn('Recharts not available, charts will be disabled');
}

interface LoyaltyUser {
  user_id: string;
  total_balance: number;
  active_balance: number;
  total_earned: number;
  total_redeemed: number;
  tier: string;
  last_activity: string;
  created_at: string;
}

interface LoyaltyStats {
  totalUsers: number;
  totalJewels: number;
  totalEarned: number;
  totalRedeemed: number;
}

export default function AdminLoyaltyManager() {
  const [users, setUsers] = useState<LoyaltyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<LoyaltyStats>({
    totalUsers: 0,
    totalJewels: 0,
    totalEarned: 0,
    totalRedeemed: 0
  });

  // Dialog states
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LoyaltyUser | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  // Load users
  useEffect(() => {
    loadUsers();
    loadStats();
  }, [currentPage, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/loyalty/users?page=${currentPage}&search=${searchTerm}`);
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
        setTotalPages(data.pagination?.total_pages || 1);
      } else {
        setError(data.error || 'Failed to load users');
      }
    } catch (error) {
      setError('Failed to load users');
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/loyalty/users?limit=1000');
      const data = await response.json();
      
      if (response.ok && data.users) {
        const totalUsers = data.users.length;
        const totalJewels = data.users.reduce((sum: number, user: LoyaltyUser) => sum + user.active_balance, 0);
        const totalEarned = data.users.reduce((sum: number, user: LoyaltyUser) => sum + user.total_earned, 0);
        const totalRedeemed = data.users.reduce((sum: number, user: LoyaltyUser) => sum + user.total_redeemed, 0);
        
        setStats({ totalUsers, totalJewels, totalEarned, totalRedeemed });
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const handleAdjustment = async () => {
    if (!selectedUser || !adjustmentAmount || !adjustmentReason) return;

    try {
      setAdjusting(true);
      const response = await fetch('/api/admin/loyalty/adjustment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.user_id,
          adjustment_type: adjustmentType,
          amount: parseInt(adjustmentAmount),
          reason: adjustmentReason,
          admin_notes: adjustmentNotes
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setAdjustmentDialogOpen(false);
        setSelectedUser(null);
        setAdjustmentAmount('');
        setAdjustmentReason('');
        setAdjustmentNotes('');
        loadUsers();
        loadStats();
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
      case 'Diamond': return 'primary';
      case 'Platinum': return 'secondary';
      case 'Gold': return 'warning';
      case 'Silver': return 'default';
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
        💎 Luxe Jewels Loyalty Program Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #5a3d35, #d97706)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <DiamondIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body2">Total Users</Typography>
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
                    {stats.totalJewels.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">Active Jewels</Typography>
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
                    {stats.totalEarned.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">Total Earned</Typography>
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
                    {stats.totalRedeemed.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">Total Redeemed</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      {LineChart && ResponsiveContainer && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Jewels Activity Over Time
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={users.slice(0, 10).map(user => ({
                  name: user.user_id.substring(0, 8),
                  earned: user.total_earned,
                  redeemed: user.total_redeemed,
                  balance: user.active_balance
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="earned" stroke="#d97706" strokeWidth={2} />
                  <Line type="monotone" dataKey="redeemed" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Search and Actions */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedUser({} as LoyaltyUser);
            setAdjustmentDialogOpen(true);
          }}
          sx={{
            background: 'linear-gradient(45deg, #5a3d35, #d97706)',
            '&:hover': { background: 'linear-gradient(45deg, #4a332c, #b45309)' }
          }}
        >
          Add Jewels
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell>Active Balance</TableCell>
                  <TableCell>Total Earned</TableCell>
                  <TableCell>Total Redeemed</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.user_id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {user.user_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" color="primary">
                        {user.active_balance.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.total_earned.toLocaleString()}</TableCell>
                    <TableCell>{user.total_redeemed.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.tier}
                        color={getTierColor(user.tier) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.last_activity)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Adjust Jewels">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedUser(user);
                              setAdjustmentDialogOpen(true);
                            }}
                            sx={{ color: '#d97706' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Adjustment Dialog */}
      <Dialog open={adjustmentDialogOpen} onClose={() => setAdjustmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser?.user_id ? `Adjust Jewels for ${selectedUser.user_id}` : 'Add New User Jewels'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {!selectedUser?.user_id && (
              <TextField
                label="User ID"
                placeholder="Enter user ID"
                fullWidth
                onChange={(e) => setSelectedUser({ ...selectedUser, user_id: e.target.value } as LoyaltyUser)}
              />
            )}
            
            <FormControl fullWidth>
              <InputLabel>Adjustment Type</InputLabel>
              <Select
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value as 'add' | 'remove')}
                label="Adjustment Type"
              >
                <MenuItem value="add">Add Jewels</MenuItem>
                <MenuItem value="remove">Remove Jewels</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Amount"
              type="number"
              placeholder="Enter jewel amount"
              fullWidth
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(e.target.value)}
            />

            <TextField
              label="Reason"
              placeholder="Reason for adjustment"
              fullWidth
              value={adjustmentReason}
              onChange={(e) => setAdjustmentReason(e.target.value)}
            />

            <TextField
              label="Admin Notes"
              placeholder="Additional notes (optional)"
              fullWidth
              multiline
              rows={3}
              value={adjustmentNotes}
              onChange={(e) => setAdjustmentNotes(e.target.value)}
            />
          </Stack>
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
