import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

const SimpleRichTextEditor = ({ value, onChange, placeholder }) => {
  const [editorValue, setEditorValue] = useState('');

  // Sync with parent value
  useEffect(() => {
    if (value !== editorValue) {
      setEditorValue(value || '');
    }
  }, [value]);

  const handleChange = (content) => {
    setEditorValue(content);
    if (onChange) {
      // Clean empty content
      if (content === '<p><br></p>' || content === '<p></p>' || content.trim() === '') {
        onChange('');
      } else {
        onChange(content);
      }
    }
  };

  const imageHandler = async () => {
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
        // Insert image at the end of content
        const imageHtml = `<img src="${data.url}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`;
        const newContent = editorValue + imageHtml;
        handleChange(newContent);
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
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
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
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Nhập nội dung...'}
      />
    </div>
  );
};

export default SimpleRichTextEditor;