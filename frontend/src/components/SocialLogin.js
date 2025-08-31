import React, { useState } from 'react';
import './SocialLogin.css';

function SocialLogin({ onLogin }) {
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestData, setGuestData] = useState({
    name: '',
    email: ''
  });

  // Simulate social login (in real app, you'd integrate with OAuth)
  const handleFacebookLogin = () => {
    // Mock Facebook login
    const mockUser = {
      id: 'fb_' + Math.random().toString(36).substr(2, 9),
      name: 'Facebook User',
      email: 'user@facebook.com',
      picture: 'https://via.placeholder.com/50/4267B2/ffffff?text=F',
      provider: 'facebook'
    };
    onLogin(mockUser);
  };

  const handleGoogleLogin = () => {
    // Mock Google login
    const mockUser = {
      id: 'google_' + Math.random().toString(36).substr(2, 9),
      name: 'Google User',
      email: 'user@gmail.com',
      picture: 'https://via.placeholder.com/50/DB4437/ffffff?text=G',
      provider: 'google'
    };
    onLogin(mockUser);
  };

  const handleTwitterLogin = () => {
    // Mock Twitter login
    const mockUser = {
      id: 'twitter_' + Math.random().toString(36).substr(2, 9),
      name: 'Twitter User',
      email: 'user@twitter.com',
      picture: 'https://via.placeholder.com/50/1DA1F2/ffffff?text=T',
      provider: 'twitter'
    };
    onLogin(mockUser);
  };

  const handleGuestLogin = (e) => {
    e.preventDefault();
    if (guestData.name.trim()) {
      const guestUser = {
        id: 'guest_' + Math.random().toString(36).substr(2, 9),
        name: guestData.name,
        email: guestData.email || null,
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(guestData.name)}&background=5ca521&color=fff&size=50`,
        provider: 'guest'
      };
      onLogin(guestUser);
    }
  };

  return (
    <div className="social-login">
      <div className="social-buttons">
        <button className="social-btn facebook" onClick={handleFacebookLogin}>
          <span className="social-icon">📘</span>
          Facebook
        </button>
        
        <button className="social-btn google" onClick={handleGoogleLogin}>
          <span className="social-icon">🔴</span>
          Google
        </button>
        
        <button className="social-btn twitter" onClick={handleTwitterLogin}>
          <span className="social-icon">🐦</span>
          Twitter
        </button>
      </div>

      <div className="login-divider">
        <span>hoặc</span>
      </div>

      {!showGuestForm ? (
        <button 
          className="guest-login-btn"
          onClick={() => setShowGuestForm(true)}
        >
          Bình luận với tên
        </button>
      ) : (
        <form onSubmit={handleGuestLogin} className="guest-form">
          <input
            type="text"
            placeholder="Tên của bạn *"
            value={guestData.name}
            onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email (tùy chọn)"
            value={guestData.email}
            onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
          />
          <div className="guest-form-actions">
            <button type="submit">Tiếp tục</button>
            <button 
              type="button" 
              onClick={() => setShowGuestForm(false)}
            >
              Hủy
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default SocialLogin;