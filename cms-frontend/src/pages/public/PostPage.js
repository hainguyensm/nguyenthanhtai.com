import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Container,
  Typography,
  Box,
  Chip,
  Breadcrumbs,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Grid,
  Paper,
} from '@mui/material';
import { Home, Article, Category, ChevronRight } from '@mui/icons-material';
import { format } from 'date-fns';
import apiService from '../../services/api';
import getCategoryColor from '../../utils/categoryColors';

const PostPage = () => {
  const [post, setPost] = useState(null);
  const [categories, setCategories] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { slug } = useParams();

  useEffect(() => {
    fetchPost();
    fetchCategories();
    fetchRecentPosts();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const postData = await apiService.getPost(slug);
      setPost(postData);
    } catch (error) {
      console.error('Failed to fetch post:', error);
      setError('Post not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const response = await apiService.getPosts({
        page: 1,
        per_page: 5,
        status: 'published',
        post_type: 'post',
      });
      setRecentPosts(response.posts || []);
    } catch (error) {
      console.error('Failed to fetch recent posts:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Post not found'}</Alert>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.title}</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        <meta name="keywords" content={post.meta_keywords} />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          {post.category && (
            <Link
              to={`/category/${post.category.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {post.category.name}
            </Link>
          )}
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <Article sx={{ mr: 0.5 }} fontSize="inherit" />
            {post.title}
          </Typography>
        </Breadcrumbs>

        {/* Featured Image */}
        {post.featured_image && (
          <Box sx={{ mb: 4 }}>
            <img
              src={post.featured_image}
              alt={post.title}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              }}
            />
          </Box>
        )}

        {/* Post Header */}
        <Typography variant="h3" component="h1" gutterBottom>
          {post.title}
        </Typography>

        {/* Post Meta */}
        <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
          <Avatar
            src={post.author?.avatar_url}
            sx={{ width: 32, height: 32 }}
          >
            {post.author?.first_name?.[0] || post.author?.username?.[0]}
          </Avatar>
          
          <Box>
            <Typography variant="body2">
              By {post.author?.first_name || post.author?.username || 'Unknown'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Published {format(new Date(post.published_at || post.created_at), 'MMMM dd, yyyy')}
            </Typography>
          </Box>
        </Box>

        {/* Category and Tags */}
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 4 }}>
          {post.category && (
            <Chip
              component={Link}
              to={`/category/${post.category.slug}`}
              label={post.category.name}
              clickable
              sx={{ 
                textDecoration: 'none',
                backgroundColor: getCategoryColor(post.category.id).bg,
                color: getCategoryColor(post.category.id).text,
                '&:hover': {
                  backgroundColor: getCategoryColor(post.category.id).hover,
                  color: getCategoryColor(post.category.id).hoverText,
                }
              }}
            />
          )}
          
          {post.tags?.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              variant="outlined"
              size="small"
            />
          ))}
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Post Content */}
        <Box
          sx={{
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              marginTop: 3,
              marginBottom: 2,
              fontWeight: 600,
            },
            '& p': {
              marginBottom: 2,
              lineHeight: 1.7,
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 1,
              margin: '2rem 0',
            },
            '& blockquote': {
              borderLeft: '4px solid #1976d2',
              paddingLeft: 2,
              marginLeft: 0,
              fontStyle: 'italic',
              backgroundColor: 'grey.50',
              padding: 2,
              borderRadius: 1,
            },
            '& code': {
              backgroundColor: 'grey.100',
              padding: '2px 4px',
              borderRadius: 1,
              fontSize: '0.875rem',
            },
            '& pre': {
              backgroundColor: 'grey.900',
              color: 'white',
              padding: 2,
              borderRadius: 1,
              overflow: 'auto',
              '& code': {
                backgroundColor: 'transparent',
                color: 'inherit',
                padding: 0,
              },
            },
            '& ul, & ol': {
              paddingLeft: 3,
              marginBottom: 2,
            },
            '& li': {
              marginBottom: 0.5,
            },
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Post Footer */}
        <Divider sx={{ my: 4 }} />
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Last updated: {format(new Date(post.updated_at), 'MMMM dd, yyyy')}
          </Typography>
          
          {post.tags && post.tags.length > 0 && (
            <Box display="flex" gap={1}>
              <Typography variant="caption" color="text.secondary">
                Tags:
              </Typography>
              {post.tags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          )}
        </Box>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 24 }}>
              {/* Categories */}
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Category color="primary" />
                  Categories
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {categories.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {categories.map((category) => (
                      <Box
                        key={category.id}
                        component={Link}
                        to={`/category/${category.slug}`}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.5,
                          borderRadius: 1,
                          textDecoration: 'none',
                          color: getCategoryColor(category.id).text,
                          backgroundColor: getCategoryColor(category.id).bg,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: getCategoryColor(category.id).hover,
                            color: getCategoryColor(category.id).hoverText,
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {category.name}
                        </Typography>
                        <ChevronRight sx={{ fontSize: 16, opacity: 0.7 }} />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No categories available
                  </Typography>
                )}
              </Paper>

              {/* Recent Posts Widget */}
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Article color="primary" />
                  Recent Posts
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {recentPosts.length > 0 ? (
                  recentPosts.map((recentPost, index) => (
                    <Box key={recentPost.id}>
                      <Box
                        component={Link}
                        to={`/post/${recentPost.slug}`}
                        sx={{
                          display: 'block',
                          textDecoration: 'none',
                          color: 'inherit',
                          py: 1.5,
                          '&:hover': {
                            '& .post-title': {
                              color: 'primary.main',
                            },
                          },
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          className="post-title"
                          sx={{ 
                            fontWeight: 500,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            transition: 'color 0.2s ease-in-out',
                            mb: 0.5,
                          }}
                        >
                          {recentPost.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(recentPost.created_at), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                      {index < recentPosts.length - 1 && <Divider />}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recent posts available
                  </Typography>
                )}
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default PostPage;