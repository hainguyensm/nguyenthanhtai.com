import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const isLoggedIn = localStorage.getItem('token');

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Nguyen Thanh Tai Blog
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Trang chủ</Link>
          </li>
          <li className="nav-item">
            {isLoggedIn ? (
              <Link to="/admin" className="nav-link">Admin</Link>
            ) : (
              <Link to="/admin/login" className="nav-link">Đăng nhập</Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;