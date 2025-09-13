'use client';

import React from 'react';
import {
  Box,
  TextField,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { Person, Email, Phone, LocationOn, Message, Diamond, Star } from '@mui/icons-material';

interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  specialRequests?: string;
  createLoyaltyAccount?: boolean;
  subscribeToNewsletter?: boolean;
}

interface GuestInfoFormProps {
  guestInfo: GuestInfo;
  onGuestInfoChange: (field: string, value: string | boolean) => void;
}

export default function GuestInfoForm({ guestInfo, onGuestInfoChange }: GuestInfoFormProps) {
  const countries = [
    'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 
    'Germany', 'France', 'Japan', 'Singapore', 'United Arab Emirates',
    'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain'
  ];

  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
    'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
    'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad',
    'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
    'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
    'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar',
    'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur',
    'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur',
    'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad',
    'Bareilly', 'Moradabad', 'Mysore', 'Gurgaon', 'Aligarh',
    'Jalandhar', 'Tiruchirappalli', 'Bhubaneswar', 'Salem', 'Warangal',
    'Mira-Bhayandar', 'Thiruvananthapuram', 'Bhiwandi', 'Saharanpur',
    'Gorakhpur', 'Guntur', 'Bikaner', 'Amravati', 'Noida', 'Jamshedpur',
    'Bhilai', 'Cuttack', 'Firozabad', 'Kochi', 'Nellore', 'Bhavnagar',
    'Dehradun', 'Durgapur', 'Asansol', 'Rourkela', 'Nanded', 'Kolhapur',
    'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni',
    'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu', 'Sangli-Miraj',
    'Mangalore', 'Erode', 'Belgaum', 'Ambattur', 'Tirunelveli',
    'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala'
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#5a3d35' }}>
        Guest Information
      </Typography>
      
      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#d97706' }}>
            Personal Details
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name *"
            value={guestInfo.firstName}
            onChange={(e) => onGuestInfoChange('firstName', e.target.value)}
            required
            InputProps={{
              startAdornment: <Person sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name *"
            value={guestInfo.lastName}
            onChange={(e) => onGuestInfoChange('lastName', e.target.value)}
            required
            InputProps={{
              startAdornment: <Person sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email Address *"
            type="email"
            value={guestInfo.email}
            onChange={(e) => onGuestInfoChange('email', e.target.value)}
            required
            InputProps={{
              startAdornment: <Email sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number *"
            value={guestInfo.phone}
            onChange={(e) => onGuestInfoChange('phone', e.target.value)}
            required
            InputProps={{
              startAdornment: <Phone sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
        </Grid>

        {/* Address Information */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2, mt: 2, fontWeight: 600, color: '#d97706' }}>
            Address Information
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            value={guestInfo.address || ''}
            onChange={(e) => onGuestInfoChange('address', e.target.value)}
            multiline
            rows={2}
            InputProps={{
              startAdornment: <LocationOn sx={{ color: 'text.secondary', mr: 1, mt: 1 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>City</InputLabel>
            <Select
              value={guestInfo.city || ''}
              onChange={(e) => onGuestInfoChange('city', e.target.value)}
              label="City"
            >
              <MenuItem value="">Select a city</MenuItem>
              {cities.map((city) => (
                <MenuItem key={city} value={city}>{city}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Country</InputLabel>
            <Select
              value={guestInfo.country || ''}
              onChange={(e) => onGuestInfoChange('country', e.target.value)}
              label="Country"
            >
              <MenuItem value="">Select a country</MenuItem>
              {countries.map((country) => (
                <MenuItem key={country} value={country}>{country}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Special Requests */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2, mt: 2, fontWeight: 600, color: '#d97706' }}>
            Special Requests
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Special Requests or Preferences"
            value={guestInfo.specialRequests || ''}
            onChange={(e) => onGuestInfoChange('specialRequests', e.target.value)}
            multiline
            rows={3}
            placeholder="Any special requests, dietary preferences, accessibility needs, or other requirements..."
            InputProps={{
              startAdornment: <Message sx={{ color: 'text.secondary', mr: 1, mt: 1 }} />
            }}
          />
        </Grid>

        {/* Loyalty Program Signup */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2, mt: 3, fontWeight: 600, color: '#d97706' }}>
            Join Luxe Rewards (Optional)
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #5a3d35 0%, #d97706 100%)', 
            color: 'white',
            mb: 2
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Diamond sx={{ fontSize: 32, mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Unlock Exclusive Benefits
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Earn points, get member-only rates, and enjoy VIP services
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Star sx={{ fontSize: 16, mr: 1, color: '#FFD700' }} />
                    <Typography variant="body2">Earn 1 point per ₹100 spent</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Star sx={{ fontSize: 16, mr: 1, color: '#FFD700' }} />
                    <Typography variant="body2">Priority booking access</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Star sx={{ fontSize: 16, mr: 1, color: '#FFD700' }} />
                    <Typography variant="body2">Exclusive member rates</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Star sx={{ fontSize: 16, mr: 1, color: '#FFD700' }} />
                    <Typography variant="body2">VIP concierge services</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={guestInfo.createLoyaltyAccount || false}
                onChange={(e) => onGuestInfoChange('createLoyaltyAccount', e.target.checked)}
                sx={{ color: '#d97706' }}
              />
            }
            label={
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Yes, I want to join Luxe Rewards and start earning points on this booking
              </Typography>
            }
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={guestInfo.subscribeToNewsletter || false}
                onChange={(e) => onGuestInfoChange('subscribeToNewsletter', e.target.checked)}
                sx={{ color: '#d97706' }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Subscribe to our newsletter for exclusive offers and updates
              </Typography>
            }
          />
        </Grid>

        {guestInfo.createLoyaltyAccount && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Great choice!</strong> After your booking is confirmed, you'll receive an email to set up your Luxe Rewards account. 
                You'll earn points on this booking and unlock exclusive benefits for future stays.
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}





