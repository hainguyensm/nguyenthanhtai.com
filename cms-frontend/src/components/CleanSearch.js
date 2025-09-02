import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Typography,
  ClickAwayListener,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const CleanSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [featuredKeywords, setFeaturedKeywords] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedKeywords();
  }, []);

  const fetchFeaturedKeywords = async () => {
    try {
      const keywords = await apiService.getFeaturedKeywords();
      setFeaturedKeywords(keywords);
    } catch (error) {
      console.error('Failed to fetch featured keywords:', error);
      // Fallback to static keywords if API fails
      setFeaturedKeywords(['biotechnology', 'metabolic engineering', 'synthetic biology', 'bioprocessing', 'fermentation']);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() && searchTerm.length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleKeywordClick = (keyword) => {
    setSearchTerm(keyword);
    setShowResults(false);
  };

  const performSearch = async () => {
    try {
      const response = await apiService.getAutocompleteResults(searchTerm.trim());
      setSearchResults(response.suggestions || []);
      setShowResults(true);
    } catch (error) {
      setSearchResults([]);
    }
  };

  const handleClick = (url) => {
    navigate(url);
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleClickAway = () => {
    setShowResults(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setSearchResults([]);
      setShowResults(false);
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setSearchTerm('');
                    setShowResults(false);
                  }}
                  size="small"
                >
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ width: '100%' }}
        />

        {/* FEATURED KEYWORDS - SHOW WHEN NO SEARCH TERM */}
        {!searchTerm && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Featured Keywords:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {featuredKeywords.map((keyword, index) => (
                <Box
                  key={index}
                  onClick={() => handleKeywordClick(keyword)}
                  sx={{
                    px: 1,
                    py: 0.5,
                    fontSize: '0.75rem',
                    backgroundColor: '#f0f0f0',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'white',
                    }
                  }}
                >
                  {keyword}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* SINGLE DIV DROPDOWN - NO COMPLEX COMPONENTS */}
        {showResults && searchResults.length > 0 && (
          <Paper 
            elevation={8} 
            sx={{ 
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 1, 
              maxHeight: 300, 
              overflow: 'auto',
              zIndex: 1300
            }}
          >
            {searchResults.map((result, index) => (
              <Box
                key={index}
                onClick={() => handleClick(result.url)}
                sx={{ 
                  p: 1.5,
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  '&:hover': { 
                    backgroundColor: '#f5f5f5'
                  },
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}
              >
                <Typography 
                  variant="body2"
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {result.text}
                </Typography>
              </Box>
            ))}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default CleanSearch;