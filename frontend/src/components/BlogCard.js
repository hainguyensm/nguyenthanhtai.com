import React from 'react';
import { Link } from 'react-router-dom';
import './BlogCard.css';

function BlogCard({ post }) {
  return (
    <div className="blog-card">
      {post.image_url && (
        <img src={post.image_url} alt={post.title} className="blog-card-image" />
      )}
      <div className="blog-card-content">
        <h2 className="blog-card-title">
          <Link to={`/post/${post.slug}`}>{post.title}</Link>
        </h2>
        {post.category && (
          <span className="blog-card-category">{post.category}</span>
        )}
        <p className="blog-card-summary">{post.summary}</p>
        <div className="blog-card-meta">
          <span className="blog-card-author">{post.author || 'Admin'}</span>
          <span className="blog-card-date">
            {new Date(post.created_at).toLocaleDateString('vi-VN')}
          </span>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="blog-card-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="blog-card-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogCard;