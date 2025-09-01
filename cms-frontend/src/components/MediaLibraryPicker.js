import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Box,
  CircularProgress,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Search,
  Image as ImageIcon,
  VideoLibrary,
  AudioFile,
  Description,
  Folder,
  CheckCircle,
} from '@mui/icons-material';
import { format } from 'date-fns';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const MediaLibraryPicker = ({ 
  open, 
  onClose, 
  onSelect, 
  selectedMedia = null,
  allowedTypes = ['image'], // ['image', 'video', 'audio', 'document'] 
  title = "Select Media",
  maxSelection = 1 // For future multiple selection support
}) => {
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(selectedMedia);

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open, filterType]);

  useEffect(() => {
    setSelected(selectedMedia);
  }, [selectedMedia]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMedia({ type: filterType });
      
      // Filter by allowed types if specified
      let filteredMedia = response;
      if (allowedTypes.length > 0 && !allowedTypes.includes('all')) {
        filteredMedia = response.filter(item => {
          const fileType = (item.mime_type || item.type || '').split('/')[0];
          return allowedTypes.includes(fileType);
        });
      }
      
      setMedia(filteredMedia);
    } catch (error) {
      console.error('Failed to fetch media:', error);
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    const mimeType = type || '';
    if (mimeType.startsWith('image')) return <ImageIcon color="primary" />;
    if (mimeType.startsWith('video')) return <VideoLibrary color="primary" />;
    if (mimeType.startsWith('audio')) return <AudioFile color="primary" />;
    if (mimeType === 'application/pdf') return <Description color="primary" />;
    return <Folder color="primary" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleMediaSelect = (mediaItem) => {
    if (maxSelection === 1) {
      setSelected(mediaItem);
    }
  };

  const handleConfirmSelection = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  const handleClose = () => {
    setSelected(selectedMedia); // Reset selection on cancel
    onClose();
  };

  const filteredMedia = media.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alt_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFilterOptions = () => {
    const options = [{ value: 'all', label: 'All Files' }];
    
    if (allowedTypes.includes('image')) {
      options.push({ value: 'image', label: 'Images' });
    }
    if (allowedTypes.includes('video')) {
      options.push({ value: 'video', label: 'Videos' });
    }
    if (allowedTypes.includes('audio')) {
      options.push({ value: 'audio', label: 'Audio' });
    }
    if (allowedTypes.includes('document')) {
      options.push({ value: 'document', label: 'Documents' });
    }
    
    return options;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {/* Search and Filter Controls */}
        <Box display="flex" gap={2} mb={3} alignItems="center">
          <TextField
            size="small"
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filterType}
              label="Filter"
              onChange={(e) => setFilterType(e.target.value)}
            >
              {getFilterOptions().map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Media Grid */}
        <Box sx={{ minHeight: 400, maxHeight: 600, overflow: 'auto' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredMedia.length === 0 ? (
                <Grid item xs={12}>
                  <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
                    {searchTerm ? 'No media files found matching your search.' : 'No media files found.'}
                  </Typography>
                </Grid>
              ) : (
                filteredMedia.map((item) => {
                  const isSelected = selected && selected.id === item.id;
                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                      <Card 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          cursor: 'pointer',
                          border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                          position: 'relative',
                          '&:hover': {
                            boxShadow: 3,
                          }
                        }}
                        onClick={() => handleMediaSelect(item)}
                      >
                        {isSelected && (
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              backgroundColor: 'primary.main',
                              color: 'white',
                              zIndex: 1,
                              '&:hover': {
                                backgroundColor: 'primary.dark',
                              }
                            }}
                            size="small"
                          >
                            <CheckCircle />
                          </IconButton>
                        )}
                        
                        {(item.mime_type || item.type)?.startsWith('image') ? (
                          <CardMedia
                            component="img"
                            height="140"
                            image={item.url}
                            alt={item.alt_text || item.title}
                            sx={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: 140,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.100',
                            }}
                          >
                            {getFileIcon(item.mime_type || item.type)}
                          </Box>
                        )}
                        
                        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                          <Typography variant="body2" noWrap title={item.title}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatFileSize(item.file_size)} • {format(new Date(item.created_at), 'MMM dd, yyyy')}
                          </Typography>
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                          <Chip 
                            label={(item.mime_type || item.type)?.split('/')[0]} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })
              )}
            </Grid>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleConfirmSelection}
          variant="contained"
          disabled={!selected}
        >
          Select {selected ? `"${selected.title}"` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MediaLibraryPicker;