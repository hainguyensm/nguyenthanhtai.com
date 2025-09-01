import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const defaultThemes = {
  default: {
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: '#ffffff',
        paper: '#f5f5f5',
      },
      text: {
        primary: '#333333',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14,
    },
  },
  dark: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9',
      },
      secondary: {
        main: '#f48fb1',
      },
      background: {
        default: '#1a1a1a',
        paper: '#2d2d2d',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b0b0b0',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14,
    },
  },
  minimal: {
    palette: {
      mode: 'light',
      primary: {
        main: '#2e2e2e',
      },
      secondary: {
        main: '#757575',
      },
      background: {
        default: '#fafafa',
        paper: '#ffffff',
      },
      text: {
        primary: '#2e2e2e',
        secondary: '#757575',
      },
    },
    typography: {
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
      fontSize: 15,
    },
  },
  blog: {
    palette: {
      mode: 'light',
      primary: {
        main: '#ff6b35',
      },
      secondary: {
        main: '#004e89',
      },
      background: {
        default: '#fff8f0',
        paper: '#ffffff',
      },
      text: {
        primary: '#2c3e50',
        secondary: '#7f8c8d',
      },
    },
    typography: {
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontSize: 16,
    },
  },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [themeSettings, setThemeSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveTheme();
  }, []);

  const fetchActiveTheme = async () => {
    try {
      const response = await apiService.getActiveTheme();
      setCurrentTheme(response.slug || 'default');
      setThemeSettings(response.settings || {});
    } catch (error) {
      console.error('Failed to fetch active theme:', error);
      // Default to 'default' theme if fetch fails
      setCurrentTheme('default');
      setThemeSettings({});
    } finally {
      setLoading(false);
    }
  };

  const switchTheme = (themeSlug) => {
    setCurrentTheme(themeSlug);
    // Optionally refetch theme settings when switching
    fetchActiveTheme();
  };

  // Create MUI theme based on current theme
  const createMuiTheme = () => {
    const baseTheme = defaultThemes[currentTheme] || defaultThemes.default;
    
    // Merge with custom settings if available
    const customTheme = { ...baseTheme };
    
    if (themeSettings.primaryColor) {
      customTheme.palette.primary.main = themeSettings.primaryColor;
    }
    if (themeSettings.secondaryColor) {
      customTheme.palette.secondary.main = themeSettings.secondaryColor;
    }
    if (themeSettings.backgroundColor) {
      customTheme.palette.background.default = themeSettings.backgroundColor;
    }
    if (themeSettings.textColor) {
      customTheme.palette.text.primary = themeSettings.textColor;
    }
    if (themeSettings.fontFamily) {
      customTheme.typography.fontFamily = themeSettings.fontFamily;
    }
    
    return createTheme(customTheme);
  };

  const muiTheme = createMuiTheme();

  if (loading) {
    return <div>Loading theme...</div>;
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeSettings,
        switchTheme,
        fetchActiveTheme,
        availableThemes: Object.keys(defaultThemes),
      }}
    >
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};