'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Divider
} from '@mui/material';
import { Save, Refresh } from '@mui/icons-material';
import { settingsManager, AppSettings } from '@/lib/settingsManager';

export default function GeneralSettingsForm() {
  const [settings, setSettings] = useState<AppSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { settingsManager } = await import('@/lib/settingsManager');
      
      if (typeof window !== 'undefined') {
        settingsManager.initialize();
      }
      
      const generalSettings = await settingsManager.getSettingsByCategory('general');
      setSettings(generalSettings);
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: string | number | boolean) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.key === key ? { ...setting, value: String(value) } : setting
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const { settingsManager } = await import('@/lib/settingsManager');
      
      let success = true;
      for (const setting of settings) {
        const result = settingsManager.updateSetting(setting.key, setting.value);
        if (!result) {
          success = false;
          break;
        }
      }

      if (success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save some settings. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Error saving settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadSettings();
    setMessage(null);
  };

  if (loading) {
    return (
      <Box>
        <Typography>Loading settings...</Typography>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            General Settings
          </Typography>
          <Box>
            <Button
              startIcon={<Refresh />}
              onClick={handleReset}
              sx={{ mr: 2 }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4a332c, #b45309)',
                }
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Box>

        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Grid container spacing={3}>
          {settings.map((setting) => (
            <Grid item xs={12} md={6} key={setting.id}>
              {setting.type === 'string' && (
                <TextField
                  fullWidth
                  label={setting.description}
                  value={setting.value as string}
                  onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                  variant="outlined"
                />
              )}

              {setting.type === 'select' && setting.options && (
                <FormControl fullWidth>
                  <InputLabel>{setting.description}</InputLabel>
                  <Select
                    value={setting.value}
                    onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                    label={setting.description}
                  >
                    {setting.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {setting.type === 'boolean' && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={setting.value === 'true'}
                      onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                    />
                  }
                  label={setting.description}
                />
              )}

              {setting.type === 'number' && (
                <TextField
                  fullWidth
                  label={setting.description}
                  type="number"
                  value={parseFloat(setting.value) || 0}
                  onChange={(e) => handleSettingChange(setting.key, parseFloat(e.target.value) || 0)}
                  variant="outlined"
                />
              )}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

