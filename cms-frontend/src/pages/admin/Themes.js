import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  ColorPicker,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Palette,
  Settings,
  Preview,
  Check,
  Download,
  Upload,
} from '@mui/icons-material';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const Themes = () => {
  const [activeTheme, setActiveTheme] = useState('default');
  const [themes] = useState([
    {
      id: 'default',
      name: 'Default Theme',
      description: 'Clean and modern default theme',
      thumbnail: 'https://via.placeholder.com/300x200?text=Default+Theme',
      author: 'CMS Team',
      version: '1.0.0',
      active: true,
    },
    {
      id: 'dark',
      name: 'Dark Theme',
      description: 'Elegant dark theme for better readability',
      thumbnail: 'https://via.placeholder.com/300x200?text=Dark+Theme',
      author: 'CMS Team',
      version: '1.0.0',
      active: false,
    },
    {
      id: 'minimal',
      name: 'Minimal Theme',
      description: 'Simple and minimalistic design',
      thumbnail: 'https://via.placeholder.com/300x200?text=Minimal+Theme',
      author: 'CMS Team',
      version: '1.0.0',
      active: false,
    },
    {
      id: 'blog',
      name: 'Blog Theme',
      description: 'Perfect for blogging and content sites',
      thumbnail: 'https://via.placeholder.com/300x200?text=Blog+Theme',
      author: 'CMS Team',
      version: '1.0.0',
      active: false,
    },
  ]);
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [themeSettings, setThemeSettings] = useState({
    // Colors
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    
    // Typography
    fontFamily: 'Roboto',
    fontSize: '16px',
    headingFontFamily: 'Roboto',
    
    // Layout
    containerWidth: '1200px',
    sidebarPosition: 'right',
    headerStyle: 'fixed',
    
    // Features
    showSidebar: true,
    showBreadcrumbs: true,
    showSocialLinks: true,
    showSearchBar: true,
  });

  const handleActivateTheme = async (themeId) => {
    try {
      await apiService.activateTheme(themeId);
      setActiveTheme(themeId);
      toast.success('Theme activated successfully');
    } catch (error) {
      toast.error('Failed to activate theme');
    }
  };

  const handleCustomize = (theme) => {
    setSelectedTheme(theme);
    setCustomizeDialogOpen(true);
  };

  const handleSaveCustomization = async () => {
    try {
      await apiService.updateThemeSettings(selectedTheme.id, themeSettings);
      toast.success('Theme customization saved');
      setCustomizeDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save customization');
    }
  };

  const handleThemeSettingChange = (field, value) => {
    setThemeSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Themes</Typography>
        <Button
          variant="contained"
          startIcon={<Upload />}
        >
          Upload Theme
        </Button>
      </Box>

      <Grid container spacing={3}>
        {themes.map((theme) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={theme.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="140"
                image={theme.thumbnail}
                alt={theme.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6" component="div">
                    {theme.name}
                  </Typography>
                  {theme.id === activeTheme && (
                    <Chip label="Active" color="success" size="small" icon={<Check />} />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {theme.description}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  By {theme.author} • v{theme.version}
                </Typography>
              </CardContent>
              <CardActions>
                {theme.id === activeTheme ? (
                  <Button
                    size="small"
                    startIcon={<Settings />}
                    onClick={() => handleCustomize(theme)}
                  >
                    Customize
                  </Button>
                ) : (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleActivateTheme(theme.id)}
                    >
                      Activate
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Preview />}
                    >
                      Preview
                    </Button>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Customize Theme Dialog */}
      <Dialog
        open={customizeDialogOpen}
        onClose={() => setCustomizeDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Customize {selectedTheme?.name}
        </DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
            <Tab label="Colors" />
            <Tab label="Typography" />
            <Tab label="Layout" />
            <Tab label="Features" />
          </Tabs>

          {/* Colors Tab */}
          {tabValue === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Primary Color"
                  type="color"
                  value={themeSettings.primaryColor}
                  onChange={(e) => handleThemeSettingChange('primaryColor', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Secondary Color"
                  type="color"
                  value={themeSettings.secondaryColor}
                  onChange={(e) => handleThemeSettingChange('secondaryColor', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Background Color"
                  type="color"
                  value={themeSettings.backgroundColor}
                  onChange={(e) => handleThemeSettingChange('backgroundColor', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Text Color"
                  type="color"
                  value={themeSettings.textColor}
                  onChange={(e) => handleThemeSettingChange('textColor', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}

          {/* Typography Tab */}
          {tabValue === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Font Family</InputLabel>
                  <Select
                    value={themeSettings.fontFamily}
                    label="Font Family"
                    onChange={(e) => handleThemeSettingChange('fontFamily', e.target.value)}
                  >
                    <MenuItem value="Roboto">Roboto</MenuItem>
                    <MenuItem value="Open Sans">Open Sans</MenuItem>
                    <MenuItem value="Lato">Lato</MenuItem>
                    <MenuItem value="Montserrat">Montserrat</MenuItem>
                    <MenuItem value="Poppins">Poppins</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Base Font Size"
                  value={themeSettings.fontSize}
                  onChange={(e) => handleThemeSettingChange('fontSize', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Heading Font Family</InputLabel>
                  <Select
                    value={themeSettings.headingFontFamily}
                    label="Heading Font Family"
                    onChange={(e) => handleThemeSettingChange('headingFontFamily', e.target.value)}
                  >
                    <MenuItem value="Roboto">Roboto</MenuItem>
                    <MenuItem value="Playfair Display">Playfair Display</MenuItem>
                    <MenuItem value="Merriweather">Merriweather</MenuItem>
                    <MenuItem value="Oswald">Oswald</MenuItem>
                    <MenuItem value="Raleway">Raleway</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {/* Layout Tab */}
          {tabValue === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Container Width"
                  value={themeSettings.containerWidth}
                  onChange={(e) => handleThemeSettingChange('containerWidth', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Sidebar Position</InputLabel>
                  <Select
                    value={themeSettings.sidebarPosition}
                    label="Sidebar Position"
                    onChange={(e) => handleThemeSettingChange('sidebarPosition', e.target.value)}
                  >
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="right">Right</MenuItem>
                    <MenuItem value="none">No Sidebar</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Header Style</InputLabel>
                  <Select
                    value={themeSettings.headerStyle}
                    label="Header Style"
                    onChange={(e) => handleThemeSettingChange('headerStyle', e.target.value)}
                  >
                    <MenuItem value="fixed">Fixed</MenuItem>
                    <MenuItem value="static">Static</MenuItem>
                    <MenuItem value="sticky">Sticky</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {/* Features Tab */}
          {tabValue === 3 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeSettings.showSidebar}
                      onChange={(e) => handleThemeSettingChange('showSidebar', e.target.checked)}
                    />
                  }
                  label="Show Sidebar"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeSettings.showBreadcrumbs}
                      onChange={(e) => handleThemeSettingChange('showBreadcrumbs', e.target.checked)}
                    />
                  }
                  label="Show Breadcrumbs"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeSettings.showSocialLinks}
                      onChange={(e) => handleThemeSettingChange('showSocialLinks', e.target.checked)}
                    />
                  }
                  label="Show Social Links"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeSettings.showSearchBar}
                      onChange={(e) => handleThemeSettingChange('showSearchBar', e.target.checked)}
                    />
                  }
                  label="Show Search Bar"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomizeDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCustomization}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Themes;