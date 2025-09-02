import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  Menu,
  MenuItem,
  LinearProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Edit,
  MoreVert,
  ContentCopy,
  Search,
  FilterList,
  Image as ImageIcon,
  VideoLibrary,
  AudioFile,
  Description,
  Folder,
  Download,
  Visibility,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

const MediaLibrary = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetchMedia();
  }, [filterType]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMedia({ type: filterType });
      setMedia(response);
    } catch (error) {
      console.error('Failed to fetch media:', error);
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    setUploadProgress(0);

    const totalFiles = acceptedFiles.length;
    let uploadedCount = 0;

    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      try {
        const response = await apiService.uploadMedia(formData, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              ((uploadedCount + progressEvent.loaded / progressEvent.total) * 100) / totalFiles
            );
            setUploadProgress(percentCompleted);
          },
        });
        
        // Add URL to response if missing
        if (response && !response.url && response.filename) {
          response.url = `/uploads/${response.file_type === 'image' ? 'images' : 'documents'}/${response.filename}`;
        }
        
        setMedia(prev => [response, ...prev]);
        uploadedCount++;
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        toast.error(`Failed to upload ${file.name}: ${error.response?.data?.error || error.message}`);
      }
    }

    setUploading(false);
    setUploadProgress(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      // Images
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.tiff'],
      // Videos
      'video/*': ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv'],
      // Audio
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'],
      // Documents
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      // Archives
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-7z-compressed': ['.7z'],
      'application/x-tar': ['.tar'],
      'application/gzip': ['.gz'],
      // Text files
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/xml': ['.xml'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB max file size
  });

  const handleMenuClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedMedia(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handlePreview = () => {
    setPreviewDialogOpen(true);
    handleMenuClose();
  };

  const handleCopyUrl = () => {
    if (selectedMedia) {
      navigator.clipboard.writeText(selectedMedia.url);
      toast.success('URL copied to clipboard');
    }
    handleMenuClose();
  };

  const handleDownload = () => {
    if (selectedMedia) {
      window.open(selectedMedia.url, '_blank');
    }
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      await apiService.deleteMedia(selectedMedia.id);
      setMedia(prev => prev.filter(item => item.id !== selectedMedia.id));
      toast.success('Media deleted successfully');
    } catch (error) {
      toast.error('Failed to delete media');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedMedia(null);
    }
  };

  const handleUpdateMedia = async (updatedData) => {
    try {
      const response = await apiService.updateMedia(selectedMedia.id, updatedData);
      setMedia(prev => prev.map(item => 
        item.id === selectedMedia.id ? response : item
      ));
      toast.success('Media updated successfully');
      setEditDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update media');
    }
  };

  const getFileIcon = (type, filename) => {
    // Images
    if (type.startsWith('image')) return <ImageIcon />;
    
    // Videos
    if (type.startsWith('video')) return <VideoLibrary />;
    
    // Audio
    if (type.startsWith('audio')) return <AudioFile />;
    
    // PDF
    if (type === 'application/pdf') return <Description color="error" />;
    
    // Microsoft Office Documents
    if (type.includes('msword') || type.includes('wordprocessingml') || filename?.endsWith('.doc') || filename?.endsWith('.docx')) {
      return <Description color="primary" />;
    }
    
    // Excel
    if (type.includes('excel') || type.includes('spreadsheetml') || filename?.endsWith('.xls') || filename?.endsWith('.xlsx')) {
      return <Description color="success" />;
    }
    
    // PowerPoint
    if (type.includes('powerpoint') || type.includes('presentationml') || filename?.endsWith('.ppt') || filename?.endsWith('.pptx')) {
      return <Description color="warning" />;
    }
    
    // Archives
    if (type.includes('zip') || type.includes('rar') || type.includes('7z') || type.includes('tar') || type.includes('gzip')) {
      return <Folder color="secondary" />;
    }
    
    // Text files
    if (type.startsWith('text') || type.includes('json') || type.includes('xml')) {
      return <Description />;
    }
    
    // Default
    return <Folder />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredMedia = media.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alt_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Media Library</Typography>
        <Box display="flex" gap={2}>
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
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filterType}
              label="Filter"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="image">Images</MenuItem>
              <MenuItem value="video">Videos</MenuItem>
              <MenuItem value="audio">Audio</MenuItem>
              <MenuItem value="document">Documents</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Library" />
          <Tab label="Upload" />
        </Tabs>
      </Paper>

      {tabValue === 0 ? (
        <Paper sx={{ p: 3 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredMedia.length === 0 ? (
                <Grid item xs={12}>
                  <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
                    {searchTerm ? 'No media files found matching your search.' : 'No media files found. Upload some files to get started.'}
                  </Typography>
                </Grid>
              ) : (
                filteredMedia.map((item) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                          {getFileIcon(item.mime_type || item.type, item.filename)}
                        </Box>
                      )}
                      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                        <Typography variant="body2" noWrap title={item.title}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatFileSize(item.size)} • {format(new Date(item.created_at), 'MMM dd, yyyy')}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                        <Chip 
                          label={(item.mime_type || item.type)?.split('/')[0]} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                        <IconButton size="small" onClick={(e) => handleMenuClick(e, item)}>
                          <MoreVert />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 6,
              textAlign: 'center',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              or click to select files
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Supported formats: Images (PNG, JPG, GIF, SVG), Videos (MP4, AVI, MOV), Audio (MP3, WAV), Documents (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX), Archives (ZIP, RAR, 7Z), Text (TXT, CSV, JSON)
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
              Maximum file size: 100MB
            </Typography>
          </Box>

          {uploading && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" gutterBottom>
                Uploading... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </Paper>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handlePreview}>
          <Visibility sx={{ mr: 1 }} fontSize="small" />
          Preview
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit Details
        </MenuItem>
        <MenuItem onClick={handleCopyUrl}>
          <ContentCopy sx={{ mr: 1 }} fontSize="small" />
          Copy URL
        </MenuItem>
        <MenuItem onClick={handleDownload}>
          <Download sx={{ mr: 1 }} fontSize="small" />
          Download
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Media Details</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            defaultValue={selectedMedia?.title}
            margin="normal"
            id="media-title"
          />
          <TextField
            fullWidth
            label="Alt Text"
            defaultValue={selectedMedia?.alt_text}
            margin="normal"
            multiline
            rows={2}
            id="media-alt-text"
          />
          <TextField
            fullWidth
            label="Caption"
            defaultValue={selectedMedia?.caption}
            margin="normal"
            multiline
            rows={2}
            id="media-caption"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={() => {
              const title = document.getElementById('media-title').value;
              const alt_text = document.getElementById('media-alt-text').value;
              const caption = document.getElementById('media-caption').value;
              handleUpdateMedia({ title, alt_text, caption });
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog 
        open={previewDialogOpen} 
        onClose={() => setPreviewDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>{selectedMedia?.title}</DialogTitle>
        <DialogContent>
          {(selectedMedia?.mime_type || selectedMedia?.type)?.startsWith('image') && (
            <img 
              src={selectedMedia.url} 
              alt={selectedMedia.alt_text || selectedMedia.title}
              style={{ width: '100%', height: 'auto' }}
            />
          )}
          {(selectedMedia?.mime_type || selectedMedia?.type)?.startsWith('video') && (
            <video 
              src={selectedMedia.url} 
              controls
              style={{ width: '100%', height: 'auto' }}
            />
          )}
          {(selectedMedia?.mime_type || selectedMedia?.type)?.startsWith('audio') && (
            <audio src={selectedMedia.url} controls style={{ width: '100%' }} />
          )}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              <strong>File Type:</strong> {selectedMedia?.mime_type || selectedMedia?.type}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Size:</strong> {formatFileSize(selectedMedia?.size || 0)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Uploaded:</strong> {selectedMedia && format(new Date(selectedMedia.created_at), 'PPP')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>URL:</strong> {selectedMedia?.url}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Media</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedMedia?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediaLibrary;