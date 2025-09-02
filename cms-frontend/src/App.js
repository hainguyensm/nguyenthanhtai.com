import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import PublicLayout from './components/layout/PublicLayout';
import HomePage from './pages/public/HomePage';
import PostPage from './pages/public/PostPage';
import CategoryPage from './pages/public/CategoryPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import SearchResultsPage from './pages/public/SearchResultsPage';
import PDFViewerPage from './pages/public/PDFViewerPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import PostList from './pages/admin/PostList';
import PostEditor from './pages/admin/PostEditor';
import MediaLibrary from './pages/admin/MediaLibrary';
import Categories from './pages/admin/Categories';
import Comments from './pages/admin/Comments';
import Users from './pages/admin/Users';
import Settings from './pages/admin/Settings';
import Themes from './pages/admin/Themes';
import Profile from './pages/admin/Profile';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="post/:slug" element={<PostPage />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="pdf/:filename" element={<PDFViewerPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole={['admin', 'editor', 'author']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="posts" element={<PostList />} />
          <Route path="posts/new" element={<PostEditor />} />
          <Route path="posts/edit/:id" element={<PostEditor />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="categories" element={<Categories />} />
          <Route path="comments" element={<Comments />} />
          <Route path="users" element={
            <ProtectedRoute requiredRole={['admin', 'editor']}>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute requiredRole={['admin']}>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="themes" element={
            <ProtectedRoute requiredRole={['admin']}>
              <Themes />
            </ProtectedRoute>
          } />
          <Route path="profile" element={<Profile />} />
        </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;