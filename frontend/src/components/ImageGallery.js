import React, { useState, useEffect } from 'react';
import { blogApi } from '../api/api';
import './ImageGallery.css';

const ImageGallery = ({ onImageSelect, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await blogApi.getImages();
      setImages(response.data.images);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (image) => {
    setSelectedImage(image);
  };

  const handleUseImage = () => {
    if (selectedImage && onImageSelect) {
      onImageSelect(selectedImage.url, selectedImage.filename);
      onClose && onClose();
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (window.confirm('Bạn có chắc muốn xóa ảnh này?')) {
      try {
        await blogApi.deleteImage(imageId);
        setImages(images.filter(img => img.id !== imageId));
        if (selectedImage && selectedImage.id === imageId) {
          setSelectedImage(null);
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('Lỗi khi xóa ảnh');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="image-gallery-overlay">
        <div className="image-gallery-modal">
          <div className="gallery-loading">Đang tải ảnh...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="image-gallery-overlay">
      <div className="image-gallery-modal">
        <div className="gallery-header">
          <h3>Thư viện ảnh</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="gallery-content">
          <div className="images-grid">
            {images.length === 0 ? (
              <div className="no-images">Chưa có ảnh nào được tải lên</div>
            ) : (
              images.map(image => (
                <div
                  key={image.id}
                  className={`image-item ${selectedImage?.id === image.id ? 'selected' : ''}`}
                  onClick={() => handleImageSelect(image)}
                >
                  <img src={image.url} alt={image.original_filename} />
                  <div className="image-info">
                    <div className="image-name" title={image.original_filename}>
                      {image.original_filename}
                    </div>
                    <div className="image-size">{formatFileSize(image.file_size)}</div>
                  </div>
                  <button
                    className="delete-image-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(image.id);
                    }}
                    title="Xóa ảnh"
                  >
                    &times;
                  </button>
                </div>
              ))
            )}
          </div>

          {selectedImage && (
            <div className="image-preview">
              <h4>Xem trước</h4>
              <img src={selectedImage.url} alt={selectedImage.original_filename} />
              <div className="preview-info">
                <p><strong>Tên file:</strong> {selectedImage.original_filename}</p>
                <p><strong>Kích thước:</strong> {formatFileSize(selectedImage.file_size)}</p>
                <p><strong>URL:</strong> {selectedImage.url}</p>
                <p><strong>Ngày tải:</strong> {new Date(selectedImage.created_at).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          )}
        </div>

        <div className="gallery-footer">
          <button onClick={onClose} className="btn-cancel">Hủy</button>
          {selectedImage && (
            <button onClick={handleUseImage} className="btn-use-image">
              Sử dụng ảnh này
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;