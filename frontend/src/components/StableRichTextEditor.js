import React, { useState, useEffect, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

const StableRichTextEditor = ({ value, onChange, placeholder }) => {
  const [internalValue, setInternalValue] = useState('');
  const [isReady, setIsReady] = useState(false);
  const quillRef = useRef(null);
  const isUpdatingRef = useRef(false);

  // Initialize and sync with parent value
  useEffect(() => {
    const normalizedValue = value || '';
    if (normalizedValue !== internalValue && !isUpdatingRef.current) {
      setInternalValue(normalizedValue);
    }
  }, [value]);

  // Mark component as ready after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (content) => {
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    
    // Clean empty content
    let cleanContent = content;
    if (content === '<p><br></p>' || content === '<p></p>' || content.trim() === '<p></p>') {
      cleanContent = '';
    }
    
    setInternalValue(cleanContent);
    
    if (onChange) {
      onChange(cleanContent);
    }
    
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  };

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      if (file.size > 16 * 1024 * 1024) {
        alert('File quá lớn. Kích thước tối đa là 16MB');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/upload/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();
        
        // Safely insert image
        if (quillRef.current) {
          try {
            const editor = quillRef.current.getEditor();
            const range = editor.getSelection(true) || { index: editor.getLength(), length: 0 };
            editor.insertEmbed(range.index, 'image', data.url);
          } catch (err) {
            // Fallback: append image HTML
            const imageHtml = `<img src="${data.url}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`;
            const newContent = internalValue + imageHtml;
            handleChange(newContent);
          }
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Lỗi khi tải ảnh lên: ' + error.message);
      }
    };
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'color': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote'],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'color',
    'list', 'bullet',
    'blockquote',
    'link', 'image'
  ];

  // Don't render until component is ready to prevent selection issues
  if (!isReady) {
    return (
      <div className="rich-text-editor">
        <div style={{ 
          minHeight: '200px', 
          border: '1px solid #ccc', 
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f9f9f9'
        }}>
          <span>Đang tải editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={internalValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Nhập nội dung...'}
        readOnly={false}
      />
    </div>
  );
};

export default StableRichTextEditor;