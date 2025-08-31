import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import apiService from '../../services/api';
import getCategoryColor from '../../utils/categoryColors';

const PublicLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPosts({
        page: 1,
        per_page: 8, // Limit to 8 results for dropdown
        status: 'published',
        search: searchTerm.trim(),
      });
      setSearchResults(response.posts || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    setAnchorEl(null);
  };

  const handlePostClick = (postSlug) => {
    navigate(`/post/${postSlug}`);
    handleSearchClear();
  };

  const handleClickAway = () => {
    setShowResults(false);
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            Nguyen Thanh Tai Blog
          </Typography>

          {/* Global Search */}
          <ClickAwayListener onClickAway={handleClickAway}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                size="small"
                variant="outlined"
                placeholder="Search all posts..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'white', opacity: 0.7 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="clear search"
                        onClick={handleSearchClear}
                        edge="end"
                        size="small"
                        sx={{ color: 'white', opacity: 0.7 }}
                      >
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: 200, sm: 300 },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  '& .MuiOutlinedInput-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    opacity: 1,
                  },
                }}
              />

              {/* Search Results Dropdown */}
              <Popper
                open={showResults && searchResults.length > 0}
                anchorEl={anchorEl}
                placement="bottom-start"
                sx={{ zIndex: 1300, width: anchorEl?.clientWidth || 300 }}
              >
                <Paper elevation={8} sx={{ mt: 1, maxHeight: 400, overflow: 'auto' }}>
                  <List dense>
                    {searchResults.map((post) => (
                      <ListItem key={post.id} disablePadding>
                        <ListItemButton
                          onClick={() => handlePostClick(post.slug)}
                          sx={{
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            py: 1.5,
                            '&:hover': {
                              backgroundColor: 'primary.light',
                              color: 'primary.contrastText',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <ListItemText
                              primary={post.title}
                              secondary={
                                post.excerpt?.substring(0, 80) + '...' || 'No excerpt available'
                              }
                              primaryTypographyProps={{
                                variant: 'body2',
                                fontWeight: 600,
                                sx: { 
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }
                              }}
                              secondaryTypographyProps={{
                                variant: 'caption',
                                sx: {
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }
                              }}
                            />
                            {post.category && (
                              <Chip
                                label={post.category.name}
                                size="small"
                                sx={{
                                  backgroundColor: getCategoryColor(post.category.id).bg,
                                  color: getCategoryColor(post.category.id).text,
                                  fontSize: '0.75rem',
                                }}
                              />
                            )}
                          </Box>
                        </ListItemButton>
                      </ListItem>
                    ))}
                    {searchTerm && searchResults.length === 0 && !loading && (
                      <ListItem>
                        <ListItemText
                          primary="No posts found"
                          secondary={`No posts found matching "${searchTerm}"`}
                          sx={{ textAlign: 'center', color: 'text.secondary' }}
                        />
                      </ListItem>
                    )}
                    {loading && (
                      <ListItem>
                        <ListItemText
                          primary="Searching..."
                          sx={{ textAlign: 'center', color: 'text.secondary' }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Popper>
            </Box>
          </ClickAwayListener>
        </Toolbar>
      </AppBar>


      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: 'grey.100',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Nguyen Thanh Tai Blog. Sharing knowledge and experiences.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicLayout;