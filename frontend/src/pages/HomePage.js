import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import { blogApi } from '../api/api';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      const params = { published: true };
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      const response = await blogApi.getPosts(params);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await blogApi.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const isAdmin = localStorage.getItem('token') && localStorage.getItem('username');

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home-page">
      {/* Site Branding & Main Navigation */}
      <header className="site-branding-wrap">
        <div className="u-wrapper">
          <div className="site-branding">
            <div className="logo-section">
              <div className="site-logo">
                <div className="logo-img">
                  <img src="/logo.png" alt="Nguyen Thanh Tai Blog" />
                </div>
              </div>
              <div className="site-info">
                <h1 className="site-title">Nguyen Thanh Tai Blog</h1>
                <p className="site-tagline">Khám phá thế giới Công nghệ Sinh học</p>
                <p className="site-description">Nghiên cứu và ứng dụng công nghệ sinh học hiện đại</p>
              </div>
            </div>
            
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
          </div>

          <nav className={`main-navigation ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <ul className="nav-menu">
              <li><a href="/" className="nav-link active">Trang chủ</a></li>
              <li><a href="/about" className="nav-link">Giới thiệu</a></li>
              <li><a href="/research" className="nav-link">Nghiên cứu</a></li>
              <li><a href="/publications" className="nav-link">Công bố</a></li>
              <li><a href="/courses" className="nav-link">Khóa học</a></li>
              <li><a href="/contact" className="nav-link">Liên hệ</a></li>
              <li>
                <button onClick={handleAdminClick} className="nav-admin-btn">
                  {isAdmin ? 'Admin Dashboard' : 'Đăng nhập'}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="container">
        {categories.length > 0 && (
          <div className="category-filter">
            <button
              className={!selectedCategory ? 'active' : ''}
              onClick={() => setSelectedCategory('')}
            >
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={selectedCategory === category ? 'active' : ''}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <div className="blog-grid">
            {posts.length > 0 ? (
              posts.map((post) => <BlogCard key={post.id} post={post} />)
            ) : (
              <p className="no-posts">Chưa có bài viết nào.</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="u-wrapper">
          <div className="copyright-text">
            <p>
              Copyright © {new Date().getFullYear()} <a href="/" className="footer-link">Nguyen Thanh Tai Blog</a>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;