import React, { useState } from 'react';
import './ChatHeader.css';

const ChatHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleChat = () => {
    if (isOpen && !isMinimized) {
      setIsMinimized(true);
    } else if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <div className="cp-chat-header">
      {/* Chat Button */}
      <div 
        className={`chat-button ${isOpen ? 'active' : ''}`}
        onClick={toggleChat}
        title="Chat với chúng tôi"
      >
        {!isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className={`chat-window ${isMinimized ? 'minimized' : ''}`}>
          <div className="chat-header-bar">
            <div className="chat-title">
              <div className="status-indicator"></div>
              <span>Hỗ trợ trực tuyến</span>
            </div>
            <div className="chat-controls">
              <button 
                className="minimize-btn"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Mở rộng" : "Thu gọn"}
              >
                {isMinimized ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="18,15 12,9 6,15"></polyline>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                )}
              </button>
              <button 
                className="close-btn"
                onClick={closeChat}
                title="Đóng chat"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="chat-content">
              <div className="chat-messages">
                <div className="welcome-message">
                  <div className="message-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className="message-content">
                    <div className="message-text">
                      Xin chào! Tôi có thể giúp gì cho bạn về Công nghệ Sinh học?
                    </div>
                    <div className="message-time">Bây giờ</div>
                  </div>
                </div>
              </div>
              
              <div className="chat-input-area">
                <div className="quick-questions">
                  <button className="quick-btn">📚 Khóa học</button>
                  <button className="quick-btn">🔬 Nghiên cứu</button>
                  <button className="quick-btn">📧 Liên hệ</button>
                </div>
                <div className="chat-input">
                  <input 
                    type="text" 
                    placeholder="Nhập tin nhắn của bạn..."
                  />
                  <button className="send-btn" title="Gửi tin nhắn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatHeader;