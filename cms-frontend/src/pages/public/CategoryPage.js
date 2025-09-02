import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Breadcrumbs,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import { Home, Category, Article, ChevronRight, Search, LocalOffer } from '@mui/icons-material';
import { format } from 'date-fns';
import apiService from '../../services/api';
import getCategoryColor from '../../utils/categoryColors';
import CleanSearch from '../../components/CleanSearch';

const CategoryPage = () => {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { slug } = useParams();

  useEffect(() => {
    fetchCategoryPosts();
    fetchCategories();
    fetchTags();
    fetchRecentPosts();
  }, [slug, page]);


  const fetchCategoryPosts = async () => {
    try {
      setLoading(true);
      // First, get categories to find the category details
      const categories = await apiService.getCategories();
      const currentCategory = categories.find(cat => cat.slug === slug);
      setCategory(currentCategory);

      if (currentCategory) {
        const response = await apiService.getPosts({
          page,
          per_page: 12,
          status: 'published',
          category_id: currentCategory.id,
        });
        setPosts(response.posts);
        setTotalPages(response.pages);
      } else {
        setError('Category not found');
      }
    } catch (error) {
      console.error('Failed to fetch category posts:', error);
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
        post_type: 'post',
      });
      setRecentPosts(response.posts || []);
    } catch (error) {
      console.error('Failed to fetch recent posts:', error);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  if (loading && posts.length === 0) {
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
          <Category sx={{ mr: 0.5 }} fontSize="inherit" />
          {category?.name || slug}
        </Typography>
      </Breadcrumbs>

      {/* Category Header */}
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {category?.name || slug}
        </Typography>
        {category?.description && (
          <Typography variant="h6" color="text.secondary">
            {category.description}
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
                        color: cat.slug === slug ? 
                          getCategoryColor(cat.id).hoverText : 
                          getCategoryColor(cat.id).text,
                        backgroundColor: cat.slug === slug ? 
                          getCategoryColor(cat.id).hover : 
                          getCategoryColor(cat.id).bg,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: getCategoryColor(cat.id).hover,
                          color: getCategoryColor(cat.id).hoverText,
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: cat.slug === slug ? 600 : 500 }}>
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


      {/* Posts Grid */}
      {posts.length > 0 ? (
        <>
          <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
            Posts in {category?.name || slug}
          </Typography>
          
          <Grid container spacing={3}>
            {posts.map((post) => (
                  <Grid item key={post.id} xs={12}>
                    <Card sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      },
                    }}>
                      {post.featured_image ? (
                        <CardMedia
                          component="img"
                          sx={{ 
                            width: { xs: '100%', sm: 250 }, 
                            height: { xs: 200, sm: 180 },
                            objectFit: 'cover'
                          }}
                          image={post.featured_image}
                          alt={post.title}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: { xs: '100%', sm: 250 }, 
                            height: { xs: 200, sm: 180 },
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Article sx={{ fontSize: 40, color: 'rgba(0,0,0,0.3)' }} />
                        </Box>
                      )}
                      
                      <CardActionArea component={Link} to={`/post/${post.slug}`} sx={{ flexGrow: 1 }}>
                        <CardContent sx={{ p: 3, height: '100%' }}>
                          <Typography gutterBottom variant="h6" component="h3">
                            {post.title}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {post.excerpt ? 
                              post.excerpt.substring(0, 150) + '...' :
                              'No excerpt available'
                            }
                          </Typography>
                          
                          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(post.created_at), 'MMM dd, yyyy')}
                            </Typography>
                            
                            {post.tags && post.tags.length > 0 && (
                              <Chip
                                size="small"
                                label={post.tags[0].name}
                                color="secondary"
                                variant="outlined"
                              />
                            )}
                          </Box>
                          
                          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                            By {post.author?.first_name || post.author?.username || 'Unknown'}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={6}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : !loading && (
        <Box textAlign="center" py={8}>
          <Typography variant="h5" color="text.secondary">
            No posts found in this category
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={2}>
            Check back later for new content!
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

export default CategoryPage;