import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', is_visible: true });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await apiService.getAdminCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (editingCategory) {
        // Update existing category
        await apiService.updateCategory(editingCategory.id, newCategory);
        toast.success('Category updated successfully');
        setEditingCategory(null);
      } else {
        // Create new category
        await apiService.createCategory(newCategory);
        toast.success('Category created successfully');
      }
      setDialogOpen(false);
      setNewCategory({ name: '', description: '', is_visible: true });
      fetchCategories();
    } catch (error) {
      toast.error(editingCategory ? 'Failed to update category' : 'Failed to create category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setNewCategory({ 
      name: category.name, 
      description: category.description || '',
      is_visible: category.is_visible !== undefined ? category.is_visible : true
    });
    setDialogOpen(true);
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await apiService.deleteCategory(categoryToDelete.id);
      toast.success('Category deleted successfully');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setNewCategory({ name: '', description: '', is_visible: true });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          New Category
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Posts</TableCell>
                <TableCell>Visibility</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description || 'No description'}</TableCell>
                  <TableCell>
                    <Box sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      backgroundColor: category.posts_count > 0 ? 'primary.light' : 'grey.200',
                      color: category.posts_count > 0 ? 'primary.contrastText' : 'text.secondary',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}>
                      {category.posts_count || 0} {category.posts_count === 1 ? 'post' : 'posts'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={category.is_visible !== false ? 'Visible' : 'Hidden'}
                      size="small"
                      color={category.is_visible !== false ? 'success' : 'default'}
                      variant={category.is_visible !== false ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      onClick={() => handleEdit(category)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      onClick={() => handleDelete(category)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create/Edit Category Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Create New Category'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={newCategory.is_visible}
                onChange={(e) => setNewCategory({ ...newCategory, is_visible: e.target.checked })}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2">
                  Show on public site
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  When disabled, this category and all its posts will be hidden from visitors
                </Typography>
              </Box>
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleCreate} 
            variant="contained"
            disabled={!newCategory.name.trim()}
          >
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the category "{categoryToDelete?.name}"?
            {categoryToDelete?.posts_count > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                <Typography variant="body2" color="warning.dark">
                  Warning: This category has {categoryToDelete.posts_count} post(s). 
                  Deleting it will remove the category from all associated posts.
                </Typography>
              </Box>
            )}
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

export default Categories;