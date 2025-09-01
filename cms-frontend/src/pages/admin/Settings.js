import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Save,
  Settings as SettingsIcon,
  Email,
  Security,
  Palette,
  Language,
} from '@mui/icons-material';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    // General Settings
    site_title: '',
    site_description: '',
    site_url: '',
    admin_email: '',
    timezone: 'UTC',
    date_format: 'YYYY-MM-DD',
    time_format: 'HH:mm:ss',
    
    // Reading Settings
    posts_per_page: 10,
    default_category: 1,
    show_on_front: 'posts',
    
    // Discussion Settings
    allow_comments: true,
    comment_moderation: true,
    comment_registration: false,
    close_comments_after_days: 14,
    
    // Media Settings
    thumbnail_size_w: 150,
    thumbnail_size_h: 150,
    medium_size_w: 300,
    medium_size_h: 300,
    large_size_w: 1024,
    large_size_h: 1024,
    uploads_use_yearmonth_folders: true,
    
    // Email Settings
    smtp_host: '',
    smtp_port: 587,
    smtp_secure: 'tls',
    smtp_username: '',
    smtp_password: '',
    email_from_name: '',
    email_from_address: '',
    
    // SEO Settings
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    google_analytics_id: '',
    google_site_verification: '',
    bing_site_verification: '',
    
    // Social Media
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSettings();
      setSettings(prevSettings => ({ ...prevSettings, ...response }));
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiService.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Settings</Typography>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<SettingsIcon />} label="General" />
          <Tab icon={<Email />} label="Email" />
          <Tab icon={<Security />} label="SEO" />
          <Tab icon={<Palette />} label="Media" />
          <Tab icon={<Language />} label="Social" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* General Settings */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  General Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Site Title"
                  value={settings.site_title}
                  onChange={(e) => handleChange('site_title', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Site URL"
                  value={settings.site_url}
                  onChange={(e) => handleChange('site_url', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Site Description"
                  value={settings.site_description}
                  onChange={(e) => handleChange('site_description', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Admin Email"
                  type="email"
                  value={settings.admin_email}
                  onChange={(e) => handleChange('admin_email', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={settings.timezone}
                    label="Timezone"
                    onChange={(e) => handleChange('timezone', e.target.value)}
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">Eastern Time</MenuItem>
                    <MenuItem value="America/Chicago">Central Time</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                    <MenuItem value="Europe/London">London</MenuItem>
                    <MenuItem value="Europe/Paris">Paris</MenuItem>
                    <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
                    <MenuItem value="Asia/Shanghai">Shanghai</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Posts Per Page"
                  type="number"
                  value={settings.posts_per_page}
                  onChange={(e) => handleChange('posts_per_page', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.allow_comments}
                      onChange={(e) => handleChange('allow_comments', e.target.checked)}
                    />
                  }
                  label="Allow Comments"
                />
              </Grid>
            </Grid>
          )}

          {/* Email Settings */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Email Configuration
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Host"
                  value={settings.smtp_host}
                  onChange={(e) => handleChange('smtp_host', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Port"
                  type="number"
                  value={settings.smtp_port}
                  onChange={(e) => handleChange('smtp_port', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Username"
                  value={settings.smtp_username}
                  onChange={(e) => handleChange('smtp_username', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Password"
                  type="password"
                  value={settings.smtp_password}
                  onChange={(e) => handleChange('smtp_password', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From Name"
                  value={settings.email_from_name}
                  onChange={(e) => handleChange('email_from_name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From Email"
                  type="email"
                  value={settings.email_from_address}
                  onChange={(e) => handleChange('email_from_address', e.target.value)}
                />
              </Grid>
            </Grid>
          )}

          {/* SEO Settings */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  SEO Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meta Title"
                  value={settings.meta_title}
                  onChange={(e) => handleChange('meta_title', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Meta Description"
                  value={settings.meta_description}
                  onChange={(e) => handleChange('meta_description', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meta Keywords"
                  value={settings.meta_keywords}
                  onChange={(e) => handleChange('meta_keywords', e.target.value)}
                  helperText="Comma-separated keywords"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Google Analytics ID"
                  value={settings.google_analytics_id}
                  onChange={(e) => handleChange('google_analytics_id', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Google Site Verification"
                  value={settings.google_site_verification}
                  onChange={(e) => handleChange('google_site_verification', e.target.value)}
                />
              </Grid>
            </Grid>
          )}

          {/* Media Settings */}
          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Media Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Thumbnail Width"
                  type="number"
                  value={settings.thumbnail_size_w}
                  onChange={(e) => handleChange('thumbnail_size_w', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Thumbnail Height"
                  type="number"
                  value={settings.thumbnail_size_h}
                  onChange={(e) => handleChange('thumbnail_size_h', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Medium Width"
                  type="number"
                  value={settings.medium_size_w}
                  onChange={(e) => handleChange('medium_size_w', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Medium Height"
                  type="number"
                  value={settings.medium_size_h}
                  onChange={(e) => handleChange('medium_size_h', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.uploads_use_yearmonth_folders}
                      onChange={(e) => handleChange('uploads_use_yearmonth_folders', e.target.checked)}
                    />
                  }
                  label="Organize uploads into month- and year-based folders"
                />
              </Grid>
            </Grid>
          )}

          {/* Social Settings */}
          {tabValue === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Social Media Links
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Facebook URL"
                  value={settings.facebook_url}
                  onChange={(e) => handleChange('facebook_url', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Twitter URL"
                  value={settings.twitter_url}
                  onChange={(e) => handleChange('twitter_url', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Instagram URL"
                  value={settings.instagram_url}
                  onChange={(e) => handleChange('instagram_url', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="LinkedIn URL"
                  value={settings.linkedin_url}
                  onChange={(e) => handleChange('linkedin_url', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="YouTube URL"
                  value={settings.youtube_url}
                  onChange={(e) => handleChange('youtube_url', e.target.value)}
                />
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;