import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/HomePage.css';

function Layout({ children, activeNavItem = '', className = '' }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = localStorage.getItem('token') && localStorage.getItem('username');

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className={`home-page ${className}`}>
      {/* Site Branding & Main Navigation */}
      <header className="site-branding-wrap">
        <div className="u-wrapper">
          <div className="site-branding">
            <div className="logo-section">
              <div className="site-logo">
                <div className="logo-img">
                  <img src="/static/logo.png" alt="Nguyen Thanh Tai Blog" />
                </div>
              </div>
              <div className="site-info">
                <h1 className="site-title">Nguyen Thanh Tai Blog</h1>
                <p className="site-tagline">Khám phá thế giới Công nghệ Sinh học</p>
                <p className="site-description">Nghiên cứu và ứng dụng công nghệ sinh học hiện đại</p>
              </div>
            </div>
            
            <button 
              className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>

          <nav className={`main-navigation ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <ul className="nav-menu">
              <li><a href="/" className={`nav-link ${activeNavItem === 'home' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Trang chủ</a></li>
              <li><a href="/about" className={`nav-link ${activeNavItem === 'about' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Giới thiệu</a></li>
              <li><a href="/research" className={`nav-link ${activeNavItem === 'research' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Nghiên cứu</a></li>
              <li><a href="/publications" className={`nav-link ${activeNavItem === 'publications' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Công bố</a></li>
              <li><a href="/courses" className={`nav-link ${activeNavItem === 'courses' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Khóa học</a></li>
              <li><a href="/contact" className={`nav-link ${activeNavItem === 'contact' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Liên hệ</a></li>
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
        <div className="u-wrapper">
          {children}
        </div>
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

export default Layout;