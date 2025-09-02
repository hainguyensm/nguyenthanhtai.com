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
  IconButton,
  Button,
  TextField,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import {
  Home,
  Article,
  Category,
  ChevronRight,
  Favorite,
  FavoriteBorder,
  Share,
  Facebook,
  Twitter,
  LinkedIn,
  Link as LinkIcon,
  Send,
  Person,
  Search,
  LocalOffer,
} from '@mui/icons-material';
import { format } from 'date-fns';
import apiService from '../../services/api';
import getCategoryColor from '../../utils/categoryColors';
import CleanSearch from '../../components/CleanSearch';

const PostPage = () => {
  const [post, setPost] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ name: '', email: '', content: '' });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const { slug } = useParams();

  useEffect(() => {
    fetchPost();
    fetchCategories();
    fetchTags();
    fetchRecentPosts();
    fetchComments();
    // Check if user has liked this post (from localStorage)
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    if (likedPosts.includes(slug)) {
      setLiked(true);
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const postData = await apiService.getPost(slug);
      setPost(postData);
      // Initialize like count from view_count or a default
      setLikeCount(postData.view_count || 0);
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

  const fetchComments = async () => {
    try {
      const response = await apiService.getPostComments(slug);
      setComments(response || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleLike = () => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    if (liked) {
      // Unlike
      const index = likedPosts.indexOf(slug);
      if (index > -1) {
        likedPosts.splice(index, 1);
      }
      setLikeCount(prev => Math.max(0, prev - 1));
    } else {
      // Like
      likedPosts.push(slug);
      setLikeCount(prev => prev + 1);
    }
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    setLiked(!liked);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post?.title || '';
    const text = post?.excerpt || '';

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
        break;
      default:
        break;
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.content.trim()) return;

    setSubmittingComment(true);
    try {
      const comment = await apiService.addComment(slug, newComment);
      setComments([comment, ...comments]);
      setNewComment({ name: '', email: '', content: '' });
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmittingComment(false);
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

  if (error || !post) {
    return (
      <Container maxWidth={false} sx={{ py: 4, px: 3 }}>
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

      <Container maxWidth={false} sx={{ py: 4, px: 3 }}>
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
                          color: 'inherit',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            '& .category-name': {
                              color: 'primary.main',
                            },
                          },
                        }}
                      >
                        <Typography variant="body2" className="category-name" sx={{ fontWeight: 500, transition: 'color 0.2s ease-in-out' }}>
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
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                }
              }}
            />
          )}
          
          {post.tags?.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              component={Link}
              to={`/search?q=${encodeURIComponent(tag.name)}`}
              clickable
              size="small"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                }
              }}
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
                  component={Link}
                  to={`/search?q=${encodeURIComponent(tag.name)}`}
                  clickable
                  size="small"
                  sx={{
                    textDecoration: 'none',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'white',
                    }
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Social Actions Section */}
        <Paper elevation={1} sx={{ p: 3, mt: 4, backgroundColor: '#f8f9fa' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            {/* Like Button */}
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton 
                onClick={handleLike}
                color={liked ? "error" : "default"}
                sx={{ 
                  transition: 'all 0.3s',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                {liked ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
              </Typography>
            </Box>

            {/* Share Buttons */}
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Share:
              </Typography>
              <IconButton 
                size="small"
                onClick={() => handleShare('facebook')}
                sx={{ color: '#1877f2' }}
              >
                <Facebook />
              </IconButton>
              <IconButton 
                size="small"
                onClick={() => handleShare('twitter')}
                sx={{ color: '#1da1f2' }}
              >
                <Twitter />
              </IconButton>
              <IconButton 
                size="small"
                onClick={() => handleShare('linkedin')}
                sx={{ color: '#0077b5' }}
              >
                <LinkedIn />
              </IconButton>
              <Tooltip title={showShareTooltip ? "Link copied!" : "Copy link"} arrow>
                <IconButton 
                  size="small"
                  onClick={() => handleShare('copy')}
                >
                  <LinkIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* Comments Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Comments ({comments.length})
          </Typography>

          {/* Comment Form */}
          <Card sx={{ mb: 4, backgroundColor: '#f8f9fa' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Leave a Comment
              </Typography>
              <Box component="form" onSubmit={handleCommentSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      variant="outlined"
                      value={newComment.name}
                      onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      variant="outlined"
                      value={newComment.email}
                      onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Your Comment"
                      variant="outlined"
                      multiline
                      rows={4}
                      value={newComment.content}
                      onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Send />}
                      disabled={submittingComment}
                    >
                      {submittingComment ? 'Submitting...' : 'Post Comment'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* Comments List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <Card key={comment.id || Math.random()} variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                      <Box flex={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {comment.author_name || comment.name || 'Anonymous'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {comment.created_at ? format(new Date(comment.created_at), 'MMM dd, yyyy at h:mm a') : 'Just now'}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.primary">
                          {comment.content}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    No comments yet. Be the first to comment!
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={3}>
            <Box sx={{ position: 'sticky', top: 80 }}>

              {/* Search */}
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Search color="primary" />
                  Search Posts
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
    </>
  );
};

export default PostPage;