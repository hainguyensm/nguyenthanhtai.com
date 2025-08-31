import React, { useState } from 'react';
import ImageGallery from './ImageGallery';
import api from '../api/api';
import './ImageUpload.css';

const ImageUpload = ({ onUpload, onError, buttonText = "Tải ảnh lên", accept = "image/*" }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const handleFileSelect = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError && onError('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    if (file.size > 16 * 1024 * 1024) { // 16MB limit
      onError && onError('File quá lớn. Kích thước tối đa là 16MB');
      return;
    }

    setUploading(true);
    
    // Check authentication status
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    console.log('Authentication status:', { hasToken: !!token, username });
    
    if (!token) {
      onError && onError('Bạn cần đăng nhập để tải ảnh lên');
      setUploading(false);
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      console.log('Uploading image with token:', token.substring(0, 20) + '...');
      
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;
      console.log('Upload successful:', data);
      onUpload && onUpload(data.url, data.filename);
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Lỗi khi tải ảnh lên';
      if (error.response?.status === 401 || error.response?.status === 422) {
        if (error.response?.data?.msg) {
          // Clear invalid token from localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          
          // Optionally redirect to login or refresh page
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      onError && onError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
    e.target.value = ''; // Reset input
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleGallerySelect = (url, filename) => {
    if (onUpload) {
      onUpload(url, filename);
    }
    setShowGallery(false);
  };

  return (
    <div className="image-upload">
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="image-upload"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          className="file-input"
        />
        <label htmlFor="image-upload" className="upload-label">
          {uploading ? (
            <div className="upload-progress">
              <div className="spinner"></div>
              <span>Đang tải lên...</span>
            </div>
          ) : (
            <div className="upload-content">
              <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
              </svg>
              <div className="upload-text">
                <span className="primary-text">{buttonText}</span>
                <span className="secondary-text">hoặc kéo thả ảnh vào đây</span>
                <span className="file-info">PNG, JPG, GIF up to 16MB</span>
              </div>
            </div>
          )}
        </label>
      </div>
      
      <div className="upload-actions">
        <button 
          type="button"
          onClick={() => setShowGallery(true)}
          className="btn-gallery"
          disabled={uploading}
        >
          📁 Chọn từ thư viện
        </button>
      </div>

      {showGallery && (
        <ImageGallery
          onImageSelect={handleGallerySelect}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  );
};

export default ImageUpload;