import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Article,
  Comment,
  People,
  Photo,
  TrendingUp,
} from '@mui/icons-material';
import { format } from 'date-fns';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4">
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main` }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await apiService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'private':
        return 'info';
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
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
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.first_name || user?.username}!
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Here's what's happening with your site today.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Posts"
            value={stats?.total_posts || 0}
            icon={<Article />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Pages"
            value={stats?.total_pages || 0}
            icon={<Article />}
            color="secondary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Comments"
            value={stats?.total_comments || 0}
            icon={<Comment />}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Media Files"
            value={stats?.total_media || 0}
            icon={<Photo />}
            color="info"
          />
        </Grid>

        {/* Recent Posts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Posts
            </Typography>
            
            {stats?.recent_posts && stats.recent_posts.length > 0 ? (
              <List>
                {stats.recent_posts.map((post) => (
                  <ListItem key={post.id} divider>
                    <ListItemAvatar>
                      <Avatar>
                        <Article />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2" noWrap>
                            {post.title}
                          </Typography>
                          <Chip
                            size="small"
                            label={post.status}
                            color={getStatusColor(post.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            By {post.author?.first_name || post.author?.username}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {format(new Date(post.created_at), 'PPp')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                No recent posts
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Comments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Comments
            </Typography>
            
            {stats?.recent_comments && stats.recent_comments.length > 0 ? (
              <List>
                {stats.recent_comments.map((comment) => (
                  <ListItem key={comment.id} divider>
                    <ListItemAvatar>
                      <Avatar>
                        <Comment />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2">
                            {comment.author_name || comment.author?.username || 'Anonymous'}
                          </Typography>
                          <Chip
                            size="small"
                            label={comment.status}
                            color={getStatusColor(comment.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" noWrap>
                            {comment.content.substring(0, 100)}
                            {comment.content.length > 100 && '...'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {format(new Date(comment.created_at), 'PPp')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                No recent comments
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                    transition: 'all 0.2s'
                  }}
                  onClick={() => window.location.href = '/admin/posts/new'}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Article sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">Create New Post</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Write a new blog post or page
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                    transition: 'all 0.2s'
                  }}
                  onClick={() => window.location.href = '/admin/media'}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Photo sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                    <Typography variant="h6">Media Library</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Upload and manage media files
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                    transition: 'all 0.2s'
                  }}
                  onClick={() => window.location.href = '/'}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6">View Site</Typography>
                    <Typography variant="body2" color="textSecondary">
                      See your site as visitors do
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;