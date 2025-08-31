import React, { useRef, useMemo, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const quillRef = useRef();
  
  // Normalize the value to prevent React Quill issues
  const normalizedValue = useMemo(() => {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'string') return '';
    // Ensure we don't pass empty paragraph tags that can cause issues
    if (value === '<p><br></p>' || value === '<p></p>') return '';
    return value;
  }, [value]);

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
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection() || { index: 0, length: 0 };
        quill.insertEmbed(range.index, 'image', data.url);
      } catch (error) {
        console.error('Upload error:', error);
        alert('Lỗi khi tải ảnh lên: ' + error.message);
      }
    };
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        
        ['blockquote', 'code-block'],
        ['link', 'image', 'video', 'formula'],
        
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video', 'formula'
  ];

  const handleChange = useCallback((content, delta, source, editor) => {
    // Prevent calling onChange if content is just empty formatting
    if (onChange) {
      // Clean empty content
      if (content === '<p><br></p>' || content === '<p></p>') {
        onChange('');
      } else {
        onChange(content);
      }
    }
  }, [onChange]);

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={normalizedValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Nhập nội dung...'}
        preserveWhitespace
        bounds=".rich-text-editor"
      />
    </div>
  );
};

export default RichTextEditor;