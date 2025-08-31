import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Autocomplete,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Save,
  Publish,
  Preview,
  ExpandMore,
  Image as ImageIcon,
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useForm, Controller } from 'react-hook-form';
import slugify from 'slugify';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const PostEditor = () => {
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [error, setError] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      status: 'draft',
      post_type: 'post',
      category_id: '',
      comment_status: 'open',
      featured_image: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
    },
  });

  const watchedTitle = watch('title');
  const watchedContent = watch('content');

  useEffect(() => {
    fetchCategories();
    fetchTags();
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

  useEffect(() => {
    // Auto-generate slug from title
    if (watchedTitle && !isEditing) {
      const autoSlug = slugify(watchedTitle, { lower: true });
      setValue('slug', autoSlug);
    }
  }, [watchedTitle, isEditing, setValue]);

  const fetchCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const data = await apiService.getTags();
      setTags(data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const fetchPost = async () => {
    try {
      setLoadingPost(true);
      const post = await apiService.getPost(id);
      
      reset({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status,
        post_type: post.post_type,
        category_id: post.category_id || '',
        comment_status: post.comment_status,
        featured_image: post.featured_image || '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        meta_keywords: post.meta_keywords || '',
      });
      
      setSelectedTags(post.tags.map(tag => tag.name));
    } catch (error) {
      setError('Failed to load post');
    } finally {
      setLoadingPost(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const postData = {
        ...data,
        tags: selectedTags,
      };

      if (isEditing) {
        await apiService.updatePost(id, postData);
        toast.success('Post updated successfully');
      } else {
        await apiService.createPost(postData);
        toast.success('Post created successfully');
        navigate('/admin/posts');
      }
    } catch (error) {
      toast.error(isEditing ? 'Failed to update post' : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (data) => {
    const publishData = { ...data, status: 'published', tags: selectedTags };
    try {
      setLoading(true);
      if (isEditing) {
        await apiService.updatePost(id, publishData);
        toast.success('Post published successfully');
      } else {
        await apiService.createPost(publishData);
        toast.success('Post published successfully');
        navigate('/admin/posts');
      }
    } catch (error) {
      toast.error('Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video'],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ['blockquote', 'code-block'],
      ['clean'],
    ],
  };

  if (loadingPost) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {isEditing ? 'Edit Post' : 'Create New Post'}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={previewMode}
              onChange={(e) => setPreviewMode(e.target.checked)}
            />
          }
          label="Preview Mode"
        />
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <TextField
                fullWidth
                label="Title"
                {...register('title', { required: 'Title is required' })}
                error={!!errors.title}
                helperText={errors.title?.message}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Slug"
                {...register('slug', { required: 'Slug is required' })}
                error={!!errors.slug}
                helperText={errors.slug?.message || 'URL-friendly version of the title'}
                sx={{ mb: 3 }}
              />

              {previewMode ? (
                <Box
                  sx={{
                    minHeight: 300,
                    p: 2,
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1 },
                    '& p': { mb: 1 },
                    '& ul, & ol': { pl: 2 },
                  }}
                  dangerouslySetInnerHTML={{ __html: watchedContent }}
                />
              ) : (
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <ReactQuill
                      {...field}
                      theme="snow"
                      modules={modules}
                      style={{ minHeight: '300px' }}
                    />
                  )}
                />
              )}

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Excerpt"
                {...register('excerpt')}
                helperText="Optional. If left blank, one will be generated from content."
                sx={{ mt: 3 }}
              />
            </Paper>

            {/* SEO Settings */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">SEO Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    label="Meta Title"
                    {...register('meta_title')}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Meta Description"
                    {...register('meta_description')}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Meta Keywords"
                    {...register('meta_keywords')}
                    helperText="Comma-separated keywords"
                  />
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Publish Box */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Publish
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  {...register('status')}
                  defaultValue="draft"
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Post Type</InputLabel>
                <Select
                  {...register('post_type')}
                  defaultValue="post"
                  label="Post Type"
                >
                  <MenuItem value="post">Post</MenuItem>
                  <MenuItem value="page">Page</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Comments</InputLabel>
                <Select
                  {...register('comment_status')}
                  defaultValue="open"
                  label="Comments"
                >
                  <MenuItem value="open">Allow Comments</MenuItem>
                  <MenuItem value="closed">Disable Comments</MenuItem>
                </Select>
              </FormControl>

              <Box display="flex" gap={1} flexDirection="column">
                <Button
                  type="submit"
                  variant="outlined"
                  startIcon={<Save />}
                  disabled={loading}
                  fullWidth
                >
                  Save Draft
                </Button>
                <Button
                  onClick={handleSubmit(handlePublish)}
                  variant="contained"
                  startIcon={<Publish />}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={20} /> : 'Publish'}
                </Button>
              </Box>
            </Paper>

            {/* Categories */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Category
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <FormControl fullWidth>
                <InputLabel>Select Category</InputLabel>
                <Select
                  {...register('category_id')}
                  label="Select Category"
                >
                  <MenuItem value="">None</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            {/* Tags */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tags
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Autocomplete
                multiple
                options={tags.map(tag => tag.name)}
                value={selectedTags}
                onChange={(event, newValue) => setSelectedTags(newValue)}
                freeSolo
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={index}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Add tags..."
                    helperText="Type and press Enter to add"
                  />
                )}
              />
            </Paper>

            {/* Featured Image */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Featured Image
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                label="Image URL"
                {...register('featured_image')}
                sx={{ mb: 2 }}
              />
              <Button
                variant="outlined"
                startIcon={<ImageIcon />}
                fullWidth
                onClick={() => navigate('/admin/media')}
              >
                Choose from Media
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default PostEditor;