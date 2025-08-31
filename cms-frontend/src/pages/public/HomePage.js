import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Chip,
  Box,
  Pagination,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Paper,
} from '@mui/material';
import {
  Article,
  ChevronRight,
  Category,
} from '@mui/icons-material';
import { format } from 'date-fns';
import apiService from '../../services/api';
import getCategoryColor from '../../utils/categoryColors';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [featuredPost, setFeaturedPost] = useState(null);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPosts({
        page,
        per_page: 9,
        status: 'published',
        post_type: 'post',
      });
      setPosts(response.posts);
      setTotalPages(response.pages);
      
      // Set first post as featured if available
      if (response.posts.length > 0 && page === 1) {
        setFeaturedPost(response.posts[0]);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setError('Failed to load posts');
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

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && posts.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const regularPosts = featuredPost ? posts.slice(1) : posts;

  return (
    <Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

        {/* Featured Post */}
        {featuredPost && (
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Featured Post
            </Typography>
            
            <Paper elevation={3} sx={{ overflow: 'hidden', mb: 6 }}>
              <Grid container>
                <Grid item xs={12} md={6}>
                  {featuredPost.featured_image ? (
                    <CardMedia
                      component="img"
                      height="300"
                      image={featuredPost.featured_image}
                      alt={featuredPost.title}
                      sx={{ height: { xs: 250, md: 300 } }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: { xs: 250, md: 300 },
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Article sx={{ fontSize: 60, color: 'rgba(0,0,0,0.3)' }} />
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {featuredPost.category && (
                      <Chip
                        label={featuredPost.category.name}
                        size="small"
                        sx={{ 
                          alignSelf: 'flex-start', 
                          mb: 2,
                          backgroundColor: getCategoryColor(featuredPost.category.id).bg,
                          color: getCategoryColor(featuredPost.category.id).text,
                          '&:hover': {
                            backgroundColor: getCategoryColor(featuredPost.category.id).hover,
                            color: getCategoryColor(featuredPost.category.id).hoverText,
                          }
                        }}
                      />
                    )}
                    
                    <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {featuredPost.title}
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
                      {featuredPost.excerpt?.substring(0, 200) + '...' || 'No excerpt available'}
                    </Typography>
                    
                    
                    <Button
                      component={Link}
                      to={`/post/${featuredPost.slug}`}
                      variant="contained"
                      sx={{ mt: 3, alignSelf: 'flex-start' }}
                      endIcon={<ChevronRight />}
                    >
                      Read Full Article
                    </Button>
                  </CardContent>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}

            {/* Latest Posts */}
            {regularPosts.length > 0 ? (
              <>
                <Box display="flex" alignItems="center" mb={4}>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }}>
                    Latest Posts
                  </Typography>
                  <Divider sx={{ flexGrow: 1, ml: 3 }} />
                </Box>
                
                <Grid container spacing={3}>
                  {regularPosts.map((post) => (
                    <Grid item key={post.id} xs={12} sm={6}>
                      <Card 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4,
                          },
                        }}
                      >
                        <CardActionArea component={Link} to={`/post/${post.slug}`}>
                          {post.featured_image ? (
                            <CardMedia
                              component="img"
                              height="200"
                              image={post.featured_image}
                              alt={post.title}
                            />
                          ) : (
                            <Box
                              sx={{
                                height: 200,
                                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Article sx={{ fontSize: 40, color: 'rgba(0,0,0,0.3)' }} />
                            </Box>
                          )}
                          
                          <CardContent sx={{ flexGrow: 1, p: 3 }}>
                            {post.category && (
                              <Chip
                                size="small"
                                label={post.category.name}
                                sx={{ 
                                  mb: 1.5,
                                  backgroundColor: getCategoryColor(post.category.id).bg,
                                  color: getCategoryColor(post.category.id).text,
                                  '&:hover': {
                                    backgroundColor: getCategoryColor(post.category.id).hover,
                                    color: getCategoryColor(post.category.id).hoverText,
                                  }
                                }}
                              />
                            )}
                            
                            <Typography 
                              gutterBottom 
                              variant="h6" 
                              component="h3" 
                              sx={{ 
                                fontWeight: 600,
                                lineHeight: 1.3,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {post.title}
                            </Typography>
                            
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              paragraph
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {post.excerpt?.substring(0, 120) + '...' || 'No excerpt available'}
                            </Typography>
                            
                            <Box display="flex" justifyContent="flex-start" alignItems="center" mt={2}>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(post.created_at), 'MMM dd')}
                              </Typography>
                            </Box>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={8}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: '50%',
                    },
                  }}
                />
              </Box>
              )}
            </>
            ) : !loading && !featuredPost && (
              <Paper sx={{ p: 8, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Article sx={{ fontSize: 80, color: 'grey.400', mb: 3 }} />
                <Typography variant="h4" color="text.secondary" gutterBottom>
                  Welcome to Nguyen Thanh Tai Blog
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  I'm just getting started! Check back soon for amazing content about technology, 
                  personal experiences, and insights I'd love to share with you.
                </Typography>
                <Button variant="outlined" size="large">
                  Subscribe for Updates
                </Button>
              </Paper>
            )}
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
                {posts.slice(0, 5).map((post, index) => (
                  <Box key={post.id}>
                    <Box
                      component={Link}
                      to={`/post/${post.slug}`}
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
                        {post.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(post.created_at), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                    {index < 4 && <Divider />}
                  </Box>
                ))}
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;