'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Grid,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
  IconButton
} from '@mui/material';
import {
  Celebration,
  Restaurant,
  Business,
  Spa,
  LocalFlorist,
  MusicNote,
  Sports,
  FamilyRestroom,
  Pets,
  Accessibility,
  Close,
  Add
} from '@mui/icons-material';

interface SpecialRequest {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface SpecialRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (requests: SpecialRequest[]) => void;
  bookingId: string;
}

const REQUEST_CATEGORIES = {
  'auspicious-occasions': {
    label: 'Auspicious Occasions',
    icon: <Celebration />,
    options: [
      'Wedding Anniversary',
      'Birthday Celebration',
      'Engagement Party',
      'Baby Shower',
      'Graduation Party',
      'Corporate Event',
      'Religious Ceremony',
      'Festival Celebration',
      'Reunion Party',
      'Other Special Occasion'
    ]
  },
  'food-preferences': {
    label: 'Food & Dining Preferences',
    icon: <Restaurant />,
    options: [
      'Vegetarian Meals',
      'Vegan Options',
      'Gluten-Free Diet',
      'Halal Food',
      'Kosher Food',
      'Jain Food',
      'Diabetic-Friendly',
      'Nut-Free Options',
      'Seafood Preferences',
      'Spice Level Preferences',
      'Breakfast in Bed',
      'Private Chef',
      'Wine Pairing',
      'Local Cuisine Experience',
      'Custom Menu'
    ]
  },
  'business-needs': {
    label: 'Business & Industry',
    icon: <Business />,
    options: [
      'Meeting Room Setup',
      'Conference Facilities',
      'Video Conferencing',
      'Presentation Equipment',
      'Business Center Access',
      'Secretarial Services',
      'Transportation to Office',
      'Corporate Catering',
      'Team Building Activities',
      'Client Entertainment',
      'Workstation Setup',
      'High-Speed Internet',
      'Printing Services',
      'Document Scanning',
      'Business Lounge Access'
    ]
  },
  'wellness-spa': {
    label: 'Wellness & Spa',
    icon: <Spa />,
    options: [
      'Spa Treatment',
      'Massage Therapy',
      'Yoga Sessions',
      'Meditation Classes',
      'Fitness Training',
      'Wellness Consultation',
      'Aromatherapy',
      'Hot Stone Therapy',
      'Facial Treatment',
      'Body Scrub',
      'Wellness Package',
      'Personal Trainer',
      'Nutrition Consultation',
      'Mindfulness Sessions',
      'Detox Programs'
    ]
  },
  'decoration-events': {
    label: 'Decoration & Events',
    icon: <LocalFlorist />,
    options: [
      'Flower Arrangements',
      'Balloon Decorations',
      'Candle Setup',
      'Theme Decoration',
      'Lighting Setup',
      'Table Centerpieces',
      'Welcome Banners',
      'Photo Booth',
      'Event Photography',
      'Videography',
      'DJ Services',
      'Live Music',
      'Dance Performance',
      'Cultural Shows',
      'Fireworks Display'
    ]
  },
  'entertainment': {
    label: 'Entertainment',
    icon: <MusicNote />,
    options: [
      'Live Music Performance',
      'DJ Services',
      'Karaoke Setup',
      'Movie Screening',
      'Gaming Console',
      'Board Games',
      'Card Games',
      'Puzzle Activities',
      'Art Classes',
      'Cooking Classes',
      'Wine Tasting',
      'Cocktail Making',
      'Dance Classes',
      'Magic Show',
      'Comedy Night'
    ]
  },
  'sports-activities': {
    label: 'Sports & Activities',
    icon: <Sports />,
    options: [
      'Swimming Pool Access',
      'Tennis Court',
      'Golf Course',
      'Fitness Center',
      'Cycling Tours',
      'Hiking Trails',
      'Water Sports',
      'Adventure Activities',
      'Yoga Classes',
      'Pilates Sessions',
      'Zumba Classes',
      'Boxing Training',
      'Rock Climbing',
      'Kayaking',
      'Fishing Trip'
    ]
  },
  'family-kids': {
    label: 'Family & Kids',
    icon: <FamilyRestroom />,
    options: [
      'Kids Club Access',
      'Babysitting Services',
      'Children\'s Activities',
      'Kids Menu',
      'High Chair',
      'Crib/Baby Cot',
      'Child Safety Gates',
      'Kids Pool',
      'Playground Access',
      'Educational Activities',
      'Arts & Crafts',
      'Story Time',
      'Kids Entertainment',
      'Family Games',
      'Childcare Services'
    ]
  },
  'pets': {
    label: 'Pet Services',
    icon: <Pets />,
    options: [
      'Pet-Friendly Room',
      'Pet Sitting Services',
      'Pet Grooming',
      'Pet Food',
      'Pet Toys',
      'Pet Walking Service',
      'Veterinary Services',
      'Pet Training',
      'Pet Photography',
      'Pet Spa Services',
      'Pet-Friendly Areas',
      'Pet Supplies',
      'Pet Emergency Care',
      'Pet Transportation',
      'Pet Boarding'
    ]
  },
  'accessibility': {
    label: 'Accessibility',
    icon: <Accessibility />,
    options: [
      'Wheelchair Access',
      'Accessible Bathroom',
      'Hearing Impaired Support',
      'Visual Impaired Support',
      'Mobility Assistance',
      'Accessible Transportation',
      'Sign Language Interpreter',
      'Braille Materials',
      'Service Animal Support',
      'Accessible Dining',
      'Emergency Assistance',
      'Medical Support',
      'Accessible Activities',
      'Companion Services',
      'Accessibility Training'
    ]
  }
};

export default function SpecialRequestDialog({ open, onClose, onSave, bookingId }: SpecialRequestDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [customRequest, setCustomRequest] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [requests, setRequests] = useState<SpecialRequest[]>([]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedOptions([]);
  };

  const handleOptionToggle = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const handleAddRequests = () => {
    const newRequests: SpecialRequest[] = [];

    // Add selected options
    selectedOptions.forEach(option => {
      newRequests.push({
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'predefined',
        category: selectedCategory,
        title: option,
        description: `Request for: ${option}`,
        priority,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    // Add custom request if provided
    if (customRequest.trim()) {
      newRequests.push({
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'custom',
        category: selectedCategory || 'other',
        title: 'Custom Request',
        description: customRequest.trim(),
        priority,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    setRequests(prev => [...prev, ...newRequests]);
    setSelectedCategory('');
    setSelectedOptions([]);
    setCustomRequest('');
    setPriority('medium');
  };

  const handleRemoveRequest = (requestId: string) => {
    setRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const handleSave = () => {
    onSave(requests);
    onClose();
  };

  const handleClose = () => {
    setRequests([]);
    setSelectedCategory('');
    setSelectedOptions([]);
    setCustomRequest('');
    setPriority('medium');
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '2px solid #f3f4f6',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Celebration sx={{ color: '#d97706' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#5a3d35' }}>
            Special Requests
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Add special requests for your stay. These will be reviewed by our team and we'll do our best to accommodate your needs.
        </Alert>

        {/* Category Selection */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d97706' }}>
          Select Request Category
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {Object.entries(REQUEST_CATEGORIES).map(([key, category]) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Button
                fullWidth
                variant={selectedCategory === key ? 'contained' : 'outlined'}
                onClick={() => handleCategoryChange(key)}
                startIcon={category.icon}
                sx={{
                  justifyContent: 'flex-start',
                  py: 2,
                  ...(selectedCategory === key && {
                    background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #4a332c, #b45309)',
                    }
                  })
                }}
              >
                {category.label}
              </Button>
            </Grid>
          ))}
        </Grid>

        {selectedCategory && (
          <>
            <Divider sx={{ my: 3 }} />
            
            {/* Priority Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d97706' }}>
                Priority Level
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  label="Priority"
                >
                  <MenuItem value="low">Low Priority</MenuItem>
                  <MenuItem value="medium">Medium Priority</MenuItem>
                  <MenuItem value="high">High Priority</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Options Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d97706' }}>
                Select Options
              </Typography>
              <Grid container spacing={1}>
                {REQUEST_CATEGORIES[selectedCategory as keyof typeof REQUEST_CATEGORIES].options.map((option) => (
                  <Grid item xs={12} sm={6} key={option}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedOptions.includes(option)}
                          onChange={() => handleOptionToggle(option)}
                          color="primary"
                        />
                      }
                      label={option}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Custom Request */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d97706' }}>
                Custom Request
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Additional details or custom request"
                value={customRequest}
                onChange={(e) => setCustomRequest(e.target.value)}
                placeholder="Please describe any additional requirements or special requests..."
                helperText="Optional: Add any specific details or custom requests not covered above"
              />
            </Box>

            {/* Add Button */}
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddRequests}
              disabled={selectedOptions.length === 0 && !customRequest.trim()}
              sx={{
                background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4a332c, #b45309)',
                }
              }}
            >
              Add Requests
            </Button>
          </>
        )}

        {/* Added Requests */}
        {requests.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d97706' }}>
              Added Requests ({requests.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {requests.map((request) => (
                <Box
                  key={request.id}
                  sx={{
                    p: 2,
                    border: '1px solid #e9ecef',
                    borderRadius: 1,
                    bgcolor: '#f8f9fa',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {request.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {request.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={request.category.replace('-', ' ')}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={request.priority}
                        color={getPriorityColor(request.priority) as any}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemoveRequest(request.id)}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '2px solid #f3f4f6' }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={requests.length === 0}
          sx={{
            background: 'linear-gradient(45deg, #5a3d35, #d97706)',
            '&:hover': {
              background: 'linear-gradient(45deg, #4a332c, #b45309)',
            }
          }}
        >
          Save Requests ({requests.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
}
