import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Paper,
  Divider,
} from '@mui/material';
import { Home, Search, Article, Category, LocalOffer, ChevronRight } from '@mui/icons-material';
import { format } from 'date-fns';
import apiService from '../../services/api';
import CleanSearch from '../../components/CleanSearch';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    if (query) {
      searchPosts();
    } else {
      setLoading(false);
    }
    fetchCategories();
    fetchTags();
    fetchRecentPosts();
  }, [query]);

  const searchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      // Search posts that match the query
      const response = await apiService.getPosts({
        page: 1,
        per_page: 50,
        status: 'published',
        search: query,
      });
      setPosts(response.posts || []);
    } catch (error) {
      console.error('Failed to search posts:', error);
      setError('Failed to search posts');
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

  const fetchTags = async () => {
    try {
      const response = await apiService.getTags();
      setTags(response || []);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const response = await apiService.getPosts({
        page: 1,
        per_page: 5,
        status: 'published',
      });
      setRecentPosts(response.posts || []);
    } catch (error) {
      console.error('Failed to fetch recent posts:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth={false} sx={{ py: 4, px: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={false} sx={{ py: 4, px: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 4, px: 3 }}>
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
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <Search sx={{ mr: 0.5 }} fontSize="inherit" />
          Search Results
        </Typography>
      </Breadcrumbs>

      {/* Search Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Search Results
        </Typography>
        {query && (
          <Typography variant="h6" color="text.secondary">
            {posts.length} results for "{query}"
          </Typography>
        )}
      </Box>

      <Grid container spacing={4}>
        {/* Left Sidebar - Categories */}
        <Grid item xs={12} md={3}>
          <Box sx={{ position: 'sticky', top: 80 }}>
            {/* Categories */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Category color="primary" />
                Categories
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {categories.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {categories.map((cat) => (
                    <Box
                      key={cat.id}
                      component={Link}
                      to={`/category/${cat.slug}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        borderRadius: 1,
                        textDecoration: 'none',
                        color: 'text.primary',
                        backgroundColor: '#f5f5f5',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: '#e0e0e0',
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {cat.name}
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

            {/* Tags Widget */}
            <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalOffer color="primary" />
                Popular Tags
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {tags.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {tags.slice(0, 15).map((tag) => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      component={Link}
                      to={`/search?q=${encodeURIComponent(tag.name)}`}
                      clickable
                      size="small"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'white',
                        },
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No tags available
                </Typography>
              )}
            </Paper>
          </Box>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={6}>
          {posts.length > 0 ? (
            <Grid container spacing={3}>
              {posts.map((post) => (
                <Grid item key={post.id} xs={12}>
                  <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                    {post.featured_image && (
                      <CardMedia
                        component="img"
                        sx={{ width: { xs: '100%', sm: 200 }, height: { xs: 200, sm: 150 } }}
                        image={post.featured_image}
                        alt={post.title}
                      />
                    )}
                    <CardActionArea component={Link} to={`/post/${post.slug}`}>
                      <CardContent>
                        <Typography gutterBottom variant="h6" component="h2">
                          {post.title}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {post.excerpt ? 
                            post.excerpt.substring(0, 200) + '...' :
                            'No excerpt available'
                          }
                        </Typography>
                        
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(post.created_at), 'MMM dd, yyyy')}
                          </Typography>
                          
                          {post.category && (
                            <Chip
                              size="small"
                              label={post.category.name}
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          
                          <Typography variant="caption" color="text.secondary">
                            By {post.author?.first_name || post.author?.username || 'Unknown'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={8}>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No results found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {query ? `No posts found for "${query}"` : 'Please enter a search term'}
              </Typography>
            </Box>
          )}
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={3}>
          <Box sx={{ position: 'sticky', top: 80 }}>

            {/* Search Widget */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Search color="primary" />
                Search
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <CleanSearch />
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
  );
};

export default SearchResultsPage;