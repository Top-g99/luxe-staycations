'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  Settings,
  Payment,
  Security,
  Notifications,
  Business
} from '@mui/icons-material';
import GeneralSettingsForm from '@/components/settings/GeneralSettingsForm';
import BusinessProfileForm from '@/components/settings/BusinessProfileForm';
import PaymentSettingsForm from '@/components/settings/PaymentSettingsForm';
import EmailSettingsForm from '@/components/settings/EmailSettingsForm';
import RazorpaySettingsForm from '@/components/settings/RazorpaySettingsForm';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <GeneralSettingsForm />;
      case 1:
        return <PaymentSettingsForm />;
      case 2:
        return <BusinessProfileForm />;
      case 3:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Security Settings
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Security and authentication settings will be implemented here.
              </Typography>
            </CardContent>
          </Card>
        );
      case 4:
        return <EmailSettingsForm />;
      case 5:
        return <RazorpaySettingsForm />;
      default:
        return <GeneralSettingsForm />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
        Settings
      </Typography>

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
              color: '#d97706'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#d97706'
            }
          }}
        >
          <Tab 
            label="General" 
            icon={<Settings />} 
            iconPosition="start"
          />
          <Tab 
            label="Payment" 
            icon={<Payment />} 
            iconPosition="start"
          />
          <Tab 
            label="Business Profile" 
            icon={<Business />} 
            iconPosition="start"
          />
          <Tab 
            label="Security" 
            icon={<Security />} 
            iconPosition="start"
          />
          <Tab 
            label="Email Settings" 
            icon={<Notifications />} 
            iconPosition="start"
          />
          <Tab 
            label="Razorpay Gateway" 
            icon={<Payment />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {renderTabContent()}
    </Box>
  );
}
