import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentRenderer from '../components/ContentRenderer';
import Comments from '../components/Comments';
import { blogApi } from '../api/api';
import './BlogPost.css';

function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await blogApi.getPost(slug);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Đang tải...</div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="error">Không tìm thấy bài viết</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="blog-post">
        <button onClick={() => navigate('/')} className="back-button">
          ← Quay lại
        </button>
        
        {post.image_url && (
          <img src={post.image_url} alt={post.title} className="post-image" />
        )}
        
        <header className="post-header">
          <h1>{post.title}</h1>
          <div className="post-meta">
            <span className="post-author">{post.author || 'Admin'}</span>
            <span className="post-date">
              {new Date(post.created_at).toLocaleDateString('vi-VN')}
            </span>
            {post.category && (
              <span className="post-category">{post.category}</span>
            )}
          </div>
        </header>

        <div className="post-content">
          <ContentRenderer content={post.content} />
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            <strong>Tags:</strong>
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Comments Section */}
        <Comments postSlug={slug} />
      </article>
    </Layout>
  );
}

export default BlogPost;