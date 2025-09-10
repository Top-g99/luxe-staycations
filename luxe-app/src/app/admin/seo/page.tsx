"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Divider,
  InputAdornment,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Download,
  Upload,
  Refresh,
  Analytics,
  Settings,
  Article,
  Map,
  Build,
  Share,
  Code,
  CheckCircle,
  Warning,
  Error,
  Info,
  MoreVert,
  ContentCopy,
  OpenInNew
} from '@mui/icons-material';
import { seoManager, SEOConfig, PageSEO, SEOAnalytics } from '@/lib/seoManager';

export default function SEOManagementPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [config, setConfig] = useState<SEOConfig | null>(null);
  const [pages, setPages] = useState<PageSEO[]>([]);
  const [analytics, setAnalytics] = useState<SEOAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [selectedPage, setSelectedPage] = useState<PageSEO | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Initialize seoManager on client side
      if (typeof window !== 'undefined') {
        seoManager.initialize();
      }
      
      const seoConfig = seoManager.getConfig();
      const seoPages = seoManager.getAllPages();
      const seoAnalytics = seoManager.getAnalytics();
      
      setConfig(seoConfig);
      setPages(seoPages);
      setAnalytics(seoAnalytics);
    } catch (error) {
      console.error('Error loading SEO data:', error);
      setSnackbar({ open: true, message: 'Error loading SEO data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleConfigChange = (field: keyof SEOConfig, value: any) => {
    if (config) {
      setConfig(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleNestedConfigChange = (parent: keyof SEOConfig, field: string, value: any) => {
    if (config) {
      setConfig(prev => prev ? {
        ...prev,
        [parent]: {
          ...prev[parent as keyof SEOConfig] as any,
          [field]: value
        }
      } : null);
    }
  };

  const handleSaveConfig = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const success = seoManager.updateConfig(config);
      if (success) {
        setSnackbar({ open: true, message: 'SEO configuration saved successfully!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Error saving SEO configuration', severity: 'error' });
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setSnackbar({ open: true, message: 'Error saving SEO configuration', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddPage = () => {
    const newPage: Omit<PageSEO, 'id' | 'createdAt' | 'updatedAt'> = {
      path: '/new-page',
      title: 'New Page',
      description: 'Page description',
      keywords: [],
      ogType: 'website',
      twitterCard: 'summary_large_image',
      robots: { index: true, follow: true },
      priority: 0.5,
      changefreq: 'monthly'
    };
    
    setSelectedPage(newPage as PageSEO);
    setEditDialogOpen(true);
  };

  const handleEditPage = (page: PageSEO) => {
    setSelectedPage(page);
    setEditDialogOpen(true);
  };

  const handleDeletePage = (pageId: string) => {
    const success = seoManager.deletePageSEO(pageId);
    if (success) {
      setPages(prev => prev.filter(p => p.id !== pageId));
      setSnackbar({ open: true, message: 'Page deleted successfully', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Error deleting page', severity: 'error' });
    }
  };

  const handleSavePage = () => {
    if (!selectedPage) return;

    try {
      let success;
      if (selectedPage.id === 'new') {
        const newPage = seoManager.addPageSEO(selectedPage);
        setPages(prev => [...prev, newPage]);
        success = true;
      } else {
        success = seoManager.updatePageSEO(selectedPage.id, selectedPage);
        if (success) {
          setPages(prev => prev.map(p => p.id === selectedPage.id ? selectedPage : p));
        }
      }

      if (success) {
        setSnackbar({ open: true, message: 'Page saved successfully!', severity: 'success' });
        setEditDialogOpen(false);
        setSelectedPage(null);
      } else {
        setSnackbar({ open: true, message: 'Error saving page', severity: 'error' });
      }
    } catch (error) {
      console.error('Error saving page:', error);
      setSnackbar({ open: true, message: 'Error saving page', severity: 'error' });
    }
  };

  const handlePreviewPage = (page: PageSEO) => {
    setSelectedPage(page);
    setPreviewDialogOpen(true);
  };

  const generateSitemap = () => {
    const sitemap = seoManager.generateSitemap();
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateRobotsTxt = () => {
    const robots = seoManager.generateRobotsTxt();
    const blob = new Blob([robots], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const calculateSEOScore = (page: PageSEO) => {
    return seoManager.calculateSEOScore(page);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderGeneralSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <TextField
              fullWidth
              label="Site Name"
              value={config?.siteName || ''}
              onChange={(e) => handleConfigChange('siteName', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Site Description"
              value={config?.siteDescription || ''}
              onChange={(e) => handleConfigChange('siteDescription', e.target.value)}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Site URL"
              value={config?.siteUrl || ''}
              onChange={(e) => handleConfigChange('siteUrl', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Default Language"
              value={config?.defaultLanguage || ''}
              onChange={(e) => handleConfigChange('defaultLanguage', e.target.value)}
              margin="normal"
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Contact & Author
            </Typography>
            <TextField
              fullWidth
              label="Author"
              value={config?.author || ''}
              onChange={(e) => handleConfigChange('author', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Publisher"
              value={config?.publisher || ''}
              onChange={(e) => handleConfigChange('publisher', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Contact Email"
              value={config?.contactEmail || ''}
              onChange={(e) => handleConfigChange('contactEmail', e.target.value)}
              margin="normal"
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Social Media
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Facebook"
                  value={config?.socialMedia?.facebook || ''}
                  onChange={(e) => handleNestedConfigChange('socialMedia', 'facebook', e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Twitter"
                  value={config?.socialMedia?.twitter || ''}
                  onChange={(e) => handleNestedConfigChange('socialMedia', 'twitter', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Instagram"
                  value={config?.socialMedia?.instagram || ''}
                  onChange={(e) => handleNestedConfigChange('socialMedia', 'instagram', e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="LinkedIn"
                  value={config?.socialMedia?.linkedin || ''}
                  onChange={(e) => handleNestedConfigChange('socialMedia', 'linkedin', e.target.value)}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAnalyticsSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Analytics
            </Typography>
            <TextField
              fullWidth
              label="Google Analytics ID"
              value={config?.analytics?.googleAnalytics || ''}
              onChange={(e) => handleNestedConfigChange('analytics', 'googleAnalytics', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Google Tag Manager ID"
              value={config?.analytics?.googleTagManager || ''}
              onChange={(e) => handleNestedConfigChange('analytics', 'googleTagManager', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Facebook Pixel ID"
              value={config?.analytics?.facebookPixel || ''}
              onChange={(e) => handleNestedConfigChange('analytics', 'facebookPixel', e.target.value)}
              margin="normal"
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Search Engine Verification
            </Typography>
            <TextField
              fullWidth
              label="Google Verification Code"
              value={config?.verification?.google || ''}
              onChange={(e) => handleNestedConfigChange('verification', 'google', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Bing Verification Code"
              value={config?.verification?.bing || ''}
              onChange={(e) => handleNestedConfigChange('verification', 'bing', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Yandex Verification Code"
              value={config?.verification?.yandex || ''}
              onChange={(e) => handleNestedConfigChange('verification', 'yandex', e.target.value)}
              margin="normal"
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderPagesManagement = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Search pages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddPage}
          sx={{
            background: 'var(--primary-dark)',
            '&:hover': { background: 'var(--secondary-dark)' }
          }}
        >
          Add Page
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Page</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>SEO Score</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPages.map((page) => {
              const score = calculateSEOScore(page);
              return (
                <TableRow key={page.id}>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {page.path}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {page.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={score}
                        color={getScoreColor(score)}
                        sx={{ width: 60, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" color={`${getScoreColor(score)}.main`}>
                        {score}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={page.robots?.index ? 'Indexed' : 'No Index'}
                      color={page.robots?.index ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedPage(page);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderTools = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sitemap
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Generate and download your sitemap.xml file
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={generateSitemap}
              fullWidth
            >
              Download Sitemap
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Robots.txt
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Generate and download your robots.txt file
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={generateRobotsTxt}
              fullWidth
            >
              Download Robots.txt
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderGeneralSettings();
      case 1:
        return renderAnalyticsSettings();
      case 2:
        return renderPagesManagement();
      case 3:
        return renderTools();
      default:
        return renderGeneralSettings();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Typography>Loading SEO settings...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontFamily: 'Playfair Display, serif',
          fontWeight: 700,
          color: 'var(--primary-dark)',
          mb: 1
        }}>
          SEO Management
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Comprehensive SEO management system for optimal search engine visibility
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 120,
              textTransform: 'none',
              fontWeight: 500
            },
            '& .Mui-selected': {
              color: 'var(--primary-dark)'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'var(--primary-dark)'
            }
          }}
        >
          <Tab 
            label="General" 
            icon={<Settings />} 
            iconPosition="start"
          />
          <Tab 
            label="Analytics" 
            icon={<Analytics />} 
            iconPosition="start"
          />
          <Tab 
            label="Pages" 
            icon={<Article />} 
            iconPosition="start"
          />
          <Tab 
            label="Tools" 
            icon={<Build />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {renderTabContent()}

      {activeTab < 2 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSaveConfig}
            disabled={saving}
            sx={{
              background: 'var(--primary-dark)',
              '&:hover': { background: 'var(--secondary-dark)' }
            }}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Box>
      )}

      {/* Page Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPage?.id === 'new' ? 'Add New Page' : 'Edit Page'}
        </DialogTitle>
        <DialogContent>
          {selectedPage && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Path"
                  value={selectedPage.path}
                  onChange={(e) => setSelectedPage({ ...selectedPage, path: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={selectedPage.title}
                  onChange={(e) => setSelectedPage({ ...selectedPage, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={selectedPage.description}
                  onChange={(e) => setSelectedPage({ ...selectedPage, description: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Keywords (comma separated)"
                  value={selectedPage.keywords.join(', ')}
                  onChange={(e) => setSelectedPage({ 
                    ...selectedPage, 
                    keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                  })}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePage} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Page Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          if (selectedPage) handleEditPage(selectedPage);
          setAnchorEl(null);
        }}>
          <ListItemIcon><Edit /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedPage) handlePreviewPage(selectedPage);
          setAnchorEl(null);
        }}>
          <ListItemIcon><Visibility /></ListItemIcon>
          <ListItemText>Preview</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedPage) handleDeletePage(selectedPage.id);
          setAnchorEl(null);
        }}>
          <ListItemIcon><Delete /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
