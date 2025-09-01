import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Check,
  Close,
  Delete,
  Reply,
  MoreVert,
  Search,
  FilterList,
  Flag,
  ThumbUp,
  Email,
  Edit,
} from '@mui/icons-material';
import { format } from 'date-fns';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    post_id: '',
  });
  const [selectedComment, setSelectedComment] = useState(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    spam: 0,
    trash: 0,
  });
  const [postsList, setPostsList] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
    fetchStats();
  }, [page, rowsPerPage, tabValue, filters]);

  useEffect(() => {
    fetchPostsList();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const status = getStatusFromTab(tabValue);
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        status: status !== 'all' ? status : undefined,
        search: filters.search || undefined,
        post_id: filters.post_id || undefined,
      };
      
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) delete params[key];
      });

      const response = await apiService.getComments(params);
      setComments(response.comments || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getCommentStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to fetch comment stats:', error);
    }
  };

  const fetchPostsList = async () => {
    try {
      const response = await apiService.getPostsList();
      setPostsList(response);
    } catch (error) {
      console.error('Failed to fetch posts list:', error);
    }
  };

  const getStatusFromTab = (tab) => {
    switch (tab) {
      case 0: return 'all';
      case 1: return 'pending';
      case 2: return 'approved';
      case 3: return 'spam';
      case 4: return 'trash';
      default: return 'all';
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleApprove = async (comment) => {
    try {
      await apiService.updateComment(comment.id, { status: 'approved' });
      toast.success('Comment approved');
      fetchComments();
      fetchStats();
    } catch (error) {
      toast.error('Failed to approve comment');
    }
  };

  const handleReject = async (comment) => {
    try {
      await apiService.updateComment(comment.id, { status: 'rejected' });
      toast.success('Comment rejected');
      fetchComments();
      fetchStats();
    } catch (error) {
      toast.error('Failed to reject comment');
    }
  };

  const handleMarkAsSpam = async (comment) => {
    try {
      await apiService.updateComment(comment.id, { status: 'spam' });
      toast.success('Comment marked as spam');
      fetchComments();
      fetchStats();
    } catch (error) {
      toast.error('Failed to mark as spam');
    }
  };

  const handleReply = () => {
    setReplyDialogOpen(true);
    handleMenuClose();
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const submitReply = async () => {
    try {
      await apiService.replyToComment(selectedComment.id, {
        content: replyText,
        author_id: user.id,
      });
      toast.success('Reply sent successfully');
      setReplyDialogOpen(false);
      setReplyText('');
      fetchComments();
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const updateComment = async (content) => {
    try {
      await apiService.updateComment(selectedComment.id, { content });
      toast.success('Comment updated');
      setEditDialogOpen(false);
      fetchComments();
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  const confirmDelete = async () => {
    try {
      await apiService.deleteComment(selectedComment.id);
      toast.success('Comment deleted');
      setDeleteDialogOpen(false);
      fetchComments();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const bulkAction = async (action, commentIds) => {
    try {
      await apiService.bulkUpdateComments({ action, ids: commentIds });
      toast.success(`Bulk ${action} completed`);
      fetchComments();
      fetchStats();
    } catch (error) {
      toast.error(`Failed to ${action} comments`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'spam': return 'error';
      case 'trash': return 'default';
      default: return 'default';
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (loading && comments.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Comments</Typography>
        <Box display="flex" gap={2}>
          <TextField
            size="small"
            placeholder="Search comments..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>In Response To</InputLabel>
            <Select
              value={filters.post_id}
              label="In Response To"
              onChange={(e) => setFilters({ ...filters, post_id: e.target.value })}
            >
              <MenuItem value="">All Posts</MenuItem>
              {postsList.map((post) => (
                <MenuItem key={post.id} value={post.id}>
                  {post.title} ({post.comment_count})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => {}}
          >
            Filter
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`All (${stats.total})`} />
          <Tab label={`Pending (${stats.pending})`} />
          <Tab label={`Approved (${stats.approved})`} />
          <Tab label={`Spam (${stats.spam})`} />
          <Tab label={`Trash (${stats.trash})`} />
        </Tabs>
      </Paper>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <input type="checkbox" />
                </TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Comment</TableCell>
                <TableCell>In Response To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id} hover>
                  <TableCell padding="checkbox">
                    <input type="checkbox" />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar 
                        src={comment.author?.avatar_url} 
                        sx={{ width: 32, height: 32 }}
                      >
                        {comment.author_name?.[0] || comment.author?.username?.[0] || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {comment.author_name || comment.author?.username || 'Anonymous'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {comment.author_email || comment.author?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {truncateText(comment.content)}
                      </Typography>
                      {comment.parent_id && (
                        <Typography variant="caption" color="primary">
                          In reply to {comment.parent?.author_name}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                      {comment.post?.title || 'Unknown Post'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={comment.status}
                      color={getStatusColor(comment.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(comment.created_at), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {format(new Date(comment.created_at), 'HH:mm')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={0.5} justifyContent="center">
                      {comment.status === 'pending' && (
                        <>
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleApprove(comment)}
                            title="Approve"
                          >
                            <Check fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleReject(comment)}
                            title="Reject"
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      <IconButton 
                        size="small"
                        onClick={(e) => handleMenuClick(e, comment)}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleReply}>
          <Reply sx={{ mr: 1 }} fontSize="small" />
          Reply
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        {selectedComment?.status !== 'spam' && (
          <MenuItem onClick={() => handleMarkAsSpam(selectedComment)}>
            <Flag sx={{ mr: 1 }} fontSize="small" />
            Mark as Spam
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reply to Comment</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              <strong>{selectedComment?.author_name}:</strong>
            </Typography>
            <Typography variant="body2">
              {selectedComment?.content}
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Reply"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitReply}>
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            defaultValue={selectedComment?.content}
            id="edit-comment-content"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={() => {
              const content = document.getElementById('edit-comment-content').value;
              updateComment(content);
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this comment? This action cannot be undone.
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

export default Comments;