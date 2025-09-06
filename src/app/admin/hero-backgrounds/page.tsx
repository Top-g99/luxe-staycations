'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Image,
  PriorityHigh,
  CalendarToday,
  Link
} from '@mui/icons-material';
import { heroBackgroundManager, HeroBackground } from '@/lib/dataManager';

export default function HeroBackgroundsAdminPage() {
  const [heroBackgrounds, setHeroBackgrounds] = useState<HeroBackground[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeroBackground | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [formData, setFormData] = useState<Partial<HeroBackground>>({
    title: '',
    subtitle: '',
    image: '',
    alt_text: '',
    active: true,
    priority: 1,
    link: '',
    link_text: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    loadHeroBackgrounds();
  }, []);

  const loadHeroBackgrounds = async () => {
    setIsLoading(true);
    try {
      await heroBackgroundManager.initialize();
      const data = heroBackgroundManager.getAll();
      setHeroBackgrounds(data);
    } catch (error) {
      console.error('Error loading hero backgrounds:', error);
      setAlert({ type: 'error', message: 'Error loading hero backgrounds' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      alt_text: '',
      active: true,
      priority: 1,
      link: '',
      link_text: '',
      start_date: '',
      end_date: ''
    });
    setDialogOpen(true);
  };

  const handleEdit = (item: HeroBackground) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      subtitle: item.subtitle,
      image: item.image,
      alt_text: item.alt_text,
      active: item.active,
      priority: item.priority,
      link: item.link,
      link_text: item.link_text,
      start_date: item.start_date,
      end_date: item.end_date
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hero background?')) {
      try {
        await heroBackgroundManager.delete(id);
        await loadHeroBackgrounds();
        setAlert({ type: 'success', message: 'Hero background deleted successfully!' });
      } catch (error) {
        setAlert({ type: 'error', message: 'Error deleting hero background' });
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        await heroBackgroundManager.update(editingItem.id, formData);
        setAlert({ type: 'success', message: 'Hero background updated successfully!' });
      } else {
        // Ensure required fields are present for creation
        if (!formData.title || !formData.image) {
          setAlert({ type: 'error', message: 'Title and Image are required fields' });
          return;
        }
        
        const createData = {
          title: formData.title,
          subtitle: formData.subtitle || '',
          image: formData.image,
          alt_text: formData.alt_text || '',
          active: formData.active || true,
          priority: formData.priority || 1,
          link: formData.link || '',
          link_text: formData.link_text || '',
          start_date: formData.start_date || '',
          end_date: formData.end_date || ''
        };
        
        await heroBackgroundManager.create(createData);
        setAlert({ type: 'success', message: 'Hero background created successfully!' });
      }
      setDialogOpen(false);
      await loadHeroBackgrounds();
    } catch (error) {
      setAlert({ type: 'error', message: 'Error saving hero background' });
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await heroBackgroundManager.update(id, { active: !currentActive });
      await loadHeroBackgrounds();
      setAlert({ type: 'success', message: 'Status updated successfully!' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Error updating status' });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Hero Backgrounds Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
        >
          Add Hero Background
        </Button>
      </Box>

      {/* Alert */}
      {alert && (
        <Alert 
          severity={alert.type} 
          sx={{ mb: 3 }}
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Backgrounds
              </Typography>
              <Typography variant="h4">
                {heroBackgrounds.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Backgrounds
              </Typography>
              <Typography variant="h4">
                {heroBackgrounds.filter(bg => bg.active).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                High Priority
              </Typography>
              <Typography variant="h4">
                {heroBackgrounds.filter(bg => bg.priority === 1).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                With Links
              </Typography>
              <Typography variant="h4">
                {heroBackgrounds.filter(bg => bg.link).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hero Backgrounds Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Subtitle</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Link</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {heroBackgrounds.map((background) => (
                  <TableRow key={background.id}>
                    <TableCell>
                      <Box
                        component="img"
                        src={background.image}
                        alt={background.alt_text || background.title}
                        sx={{
                          width: 80,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: '1px solid #ddd'
                        }}
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder.jpg';
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {background.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {background.subtitle || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`Priority ${background.priority}`} 
                        size="small" 
                        color={background.priority === 1 ? 'primary' : 'default'}
                        icon={<PriorityHigh />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={background.active ? 'Active' : 'Inactive'} 
                        size="small" 
                        color={background.active ? 'success' : 'default'}
                        icon={background.active ? <Visibility /> : <VisibilityOff />}
                      />
                    </TableCell>
                    <TableCell>
                      {background.link ? (
                        <Chip 
                          label={background.link_text || 'Has Link'} 
                          size="small" 
                          color="info"
                          icon={<Link />}
                        />
                      ) : (
                        <Typography variant="body2" color="textSecondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        {background.start_date && (
                          <Typography variant="caption" display="block">
                            From: {new Date(background.start_date).toLocaleDateString()}
                          </Typography>
                        )}
                        {background.end_date && (
                          <Typography variant="caption" display="block">
                            To: {new Date(background.end_date).toLocaleDateString()}
                          </Typography>
                        )}
                        {!background.start_date && !background.end_date && (
                          <Typography variant="caption" color="textSecondary">
                            No dates set
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(background.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Toggle Active">
                          <IconButton
                            size="small"
                            onClick={() => handleToggleActive(background.id, background.active)}
                            color={background.active ? 'success' : 'default'}
                          >
                            {background.active ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(background)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(background.id)}
                          >
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

          {heroBackgrounds.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                No hero backgrounds found. Create your first one!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Hero Background' : 'Add New Hero Background'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subtitle"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                required
                helperText="Enter the URL of the hero background image"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alt Text"
                value={formData.alt_text || ''}
                onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                helperText="Alternative text for accessibility"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority || 1}
                  onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                  label="Priority"
                >
                  <MenuItem value={1}>1 - Highest</MenuItem>
                  <MenuItem value={2}>2 - High</MenuItem>
                  <MenuItem value={3}>3 - Medium</MenuItem>
                  <MenuItem value={4}>4 - Low</MenuItem>
                  <MenuItem value={5}>5 - Lowest</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active || false}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Link URL"
                value={formData.link || ''}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                helperText="Optional link when background is clicked"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Link Text"
                value={formData.link_text || ''}
                onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                helperText="Text to display for the link"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.start_date || ''}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="When this background should start showing"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="When this background should stop showing"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
