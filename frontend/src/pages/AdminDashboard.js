import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogApi } from '../api/api';
import NativeRichTextEditor from '../components/NativeRichTextEditor';
import ImageUpload from '../components/ImageUpload';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    summary: '',
    author: '',
    category: '',
    tags: '',
    image_url: '',
    published: false
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await blogApi.getPosts({ published: 'false' });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleContentChange = (value) => {
    setFormData({
      ...formData,
      content: value
    });
  };

  const handleSummaryChange = (value) => {
    setFormData({
      ...formData,
      summary: value
    });
  };

  const handleImageUpload = (url, filename) => {
    setFormData({
      ...formData,
      image_url: url
    });
  };

  const handleImageUploadError = (error) => {
    alert('Lỗi tải ảnh: ' + error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (editingPost) {
        await blogApi.updatePost(editingPost.id, dataToSend);
      } else {
        if (!formData.slug) {
          dataToSend.slug = formData.title.toLowerCase().replace(/\s+/g, '-');
        }
        await blogApi.createPost(dataToSend);
      }
      
      fetchPosts();
      resetForm();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Lỗi khi lưu bài viết');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      summary: post.summary || '',
      author: post.author || '',
      category: post.category || '',
      tags: post.tags ? post.tags.join(', ') : '',
      image_url: post.image_url || '',
      published: post.published
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      try {
        await blogApi.deletePost(id);
        fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      summary: '',
      author: '',
      category: '',
      tags: '',
      image_url: '',
      published: false
    });
    setEditingPost(null);
    setShowForm(false);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Tạo bài viết mới
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Đăng xuất
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingPost ? 'Sửa bài viết' : 'Tạo bài viết mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Slug (URL)</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="Tự động tạo từ tiêu đề nếu để trống"
                />
              </div>

              <div className="form-group">
                <label>Tóm tắt (Trình soạn thảo nâng cao)</label>
                <NativeRichTextEditor
                  key={`summary-${editingPost?.id || 'new'}`}
                  value={formData.summary}
                  onChange={handleSummaryChange}
                  placeholder="Nhập tóm tắt bài viết..."
                />
              </div>

              <div className="form-group">
                <label>Nội dung * (Trình soạn thảo nâng cao)</label>
                <NativeRichTextEditor
                  key={`content-${editingPost?.id || 'new'}`}
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Nhập nội dung bài viết..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tác giả</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Danh mục</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="VD: Công nghệ gen"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tags (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="VD: DNA, protein, enzyme"
                />
              </div>

              <div className="form-group">
                <label>Hình ảnh bài viết</label>
                <div className="image-field">
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="Nhập URL hoặc tải ảnh lên"
                  />
                  <div className="image-upload-section">
                    <ImageUpload
                      onUpload={handleImageUpload}
                      onError={handleImageUploadError}
                      buttonText="Tải ảnh lên"
                    />
                  </div>
                  {formData.image_url && (
                    <div className="image-preview">
                      <img src={formData.image_url} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleChange}
                  />
                  Xuất bản ngay
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingPost ? 'Cập nhật' : 'Tạo bài viết'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="posts-list">
        <h2>Danh sách bài viết</h2>
        <table>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Danh mục</th>
              <th>Tác giả</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td>{post.category || '-'}</td>
                <td>{post.author || 'Admin'}</td>
                <td>
                  <span className={`status ${post.published ? 'published' : 'draft'}`}>
                    {post.published ? 'Đã xuất bản' : 'Nháp'}
                  </span>
                </td>
                <td>{new Date(post.created_at).toLocaleDateString('vi-VN')}</td>
                <td>
                  <button onClick={() => handleEdit(post)} className="btn-edit">
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(post.id)} className="btn-delete">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;