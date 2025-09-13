'use client';

import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import AdminLoyaltyManager from '../../../components/admin/AdminLoyaltyManager';
import LoyaltyRulesManager from '../../../components/admin/LoyaltyRulesManager';
import GuestLoyaltyIntegration from '../../../components/admin/GuestLoyaltyIntegration';

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
      id={`loyalty-tabpanel-${index}`}
      aria-labelledby={`loyalty-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminLoyaltyPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="loyalty management tabs"
          sx={{
            '& .MuiTab-root': {
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              minHeight: 64,
              px: 4
            }
          }}
        >
          <Tab label="👥 User Management" />
          <Tab label="⚙️ Rules Configuration" />
          <Tab label="🆕 Guest Integration" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <AdminLoyaltyManager />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <LoyaltyRulesManager />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <GuestLoyaltyIntegration />
      </TabPanel>
    </Box>
  );
}
