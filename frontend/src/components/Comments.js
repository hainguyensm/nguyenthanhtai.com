import React, { useState, useEffect } from 'react';
import { blogApi } from '../api/api';
import SocialLogin from './SocialLogin';
import './Comments.css';

function Comments({ postSlug }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [user, setUser] = useState(null);
  const [newComment, setNewComment] = useState({
    content: '',
    parent_id: null
  });
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [postSlug]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postSlug}/comments`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (userData) => {
    setUser(userData);
    setShowCommentForm(true);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user || !newComment.content.trim()) return;

    try {
      const commentData = {
        author_name: user.name,
        author_email: user.email,
        author_avatar: user.picture,
        social_provider: user.provider,
        social_id: user.id,
        content: newComment.content,
        parent_id: newComment.parent_id
      };

      const response = await fetch(`/api/posts/${postSlug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (response.ok) {
        setNewComment({ content: '', parent_id: null });
        setReplyTo(null);
        setShowCommentForm(false);
        fetchComments(); // Refresh comments
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleReply = (commentId) => {
    setReplyTo(commentId);
    setNewComment({ ...newComment, parent_id: commentId });
    setShowCommentForm(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderComment = (comment, isReply = false) => (
    <div key={comment.id} className={`comment ${isReply ? 'comment-reply' : ''}`}>
      <div className="comment-avatar">
        {comment.author_avatar ? (
          <img src={comment.author_avatar} alt={comment.author_name} />
        ) : (
          <div className="avatar-placeholder">
            {comment.author_name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{comment.author_name}</span>
          {comment.social_provider && (
            <span className={`social-badge social-${comment.social_provider}`}>
              {comment.social_provider}
            </span>
          )}
          <span className="comment-date">{formatDate(comment.created_at)}</span>
        </div>
        
        <div className="comment-text">
          {comment.content}
        </div>
        
        {!isReply && (
          <div className="comment-actions">
            <button 
              className="reply-btn"
              onClick={() => handleReply(comment.id)}
            >
              Trả lời
            </button>
          </div>
        )}
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="comments-loading">Đang tải bình luận...</div>;
  }

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h3>Bình luận ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      {!user ? (
        <div className="comment-login">
          <p>Đăng nhập để bình luận:</p>
          <SocialLogin onLogin={handleSocialLogin} />
        </div>
      ) : (
        <div className="comment-form-container">
          <div className="logged-in-user">
            <img src={user.picture} alt={user.name} className="user-avatar" />
            <span>Đăng nhập với tên {user.name}</span>
            <button 
              className="logout-btn"
              onClick={() => {
                setUser(null);
                setShowCommentForm(false);
                setReplyTo(null);
              }}
            >
              Đăng xuất
            </button>
          </div>

          {showCommentForm && (
            <form onSubmit={handleSubmitComment} className="comment-form">
              {replyTo && (
                <div className="reply-indicator">
                  Đang trả lời bình luận
                  <button 
                    type="button"
                    className="cancel-reply"
                    onClick={() => {
                      setReplyTo(null);
                      setNewComment({ content: '', parent_id: null });
                      setShowCommentForm(false);
                    }}
                  >
                    Hủy
                  </button>
                </div>
              )}
              
              <textarea
                value={newComment.content}
                onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                placeholder="Viết bình luận của bạn..."
                required
                rows={4}
              />
              
              <div className="comment-form-actions">
                <button type="submit" className="submit-comment">
                  {replyTo ? 'Trả lời' : 'Gửi bình luận'}
                </button>
                <button 
                  type="button" 
                  className="cancel-comment"
                  onClick={() => {
                    setShowCommentForm(false);
                    setReplyTo(null);
                    setNewComment({ content: '', parent_id: null });
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          )}

          {!showCommentForm && (
            <button 
              className="write-comment-btn"
              onClick={() => setShowCommentForm(true)}
            >
              Viết bình luận
            </button>
          )}
        </div>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
}

export default Comments;