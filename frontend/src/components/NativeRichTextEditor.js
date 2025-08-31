import React, { useRef, useEffect, useState, useCallback } from 'react';
import './NativeRichTextEditor.css';

const NativeRichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sync content with parent value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current && onChange) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  }, [onChange]);

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleInput();
  };

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 16 * 1024 * 1024) {
        alert('File quá lớn. Kích thước tối đa là 16MB');
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', file);

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
        
        // Insert image at current cursor position
        const img = `<img src="${data.url}" alt="Uploaded image" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
        executeCommand('insertHTML', img);
        
      } catch (error) {
        console.error('Upload error:', error);
        alert('Lỗi khi tải ảnh lên: ' + error.message);
      } finally {
        setIsUploading(false);
      }
    };
    input.click();
  };

  const addLink = () => {
    const url = prompt('Nhập URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const insertList = (type) => {
    executeCommand(type === 'ordered' ? 'insertOrderedList' : 'insertUnorderedList');
  };

  return (
    <div className="native-rich-editor">
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button type="button" onClick={() => executeCommand('bold')} title="Bold">
            <strong>B</strong>
          </button>
          <button type="button" onClick={() => executeCommand('italic')} title="Italic">
            <em>I</em>
          </button>
          <button type="button" onClick={() => executeCommand('underline')} title="Underline">
            <u>U</u>
          </button>
        </div>

        <div className="toolbar-group">
          <button type="button" onClick={() => executeCommand('formatBlock', 'H1')} title="Heading 1">
            H1
          </button>
          <button type="button" onClick={() => executeCommand('formatBlock', 'H2')} title="Heading 2">
            H2
          </button>
          <button type="button" onClick={() => executeCommand('formatBlock', 'H3')} title="Heading 3">
            H3
          </button>
          <button type="button" onClick={() => executeCommand('formatBlock', 'P')} title="Paragraph">
            P
          </button>
        </div>

        <div className="toolbar-group">
          <button type="button" onClick={() => insertList('unordered')} title="Bullet List">
            •
          </button>
          <button type="button" onClick={() => insertList('ordered')} title="Numbered List">
            1.
          </button>
          <button type="button" onClick={() => executeCommand('formatBlock', 'BLOCKQUOTE')} title="Quote">
            &ldquo;&rdquo;
          </button>
        </div>

        <div className="toolbar-group">
          <button type="button" onClick={addLink} title="Add Link">
            🔗
          </button>
          <button 
            type="button" 
            onClick={handleImageUpload} 
            title="Upload Image"
            disabled={isUploading}
          >
            {isUploading ? '⏳' : '🖼️'}
          </button>
        </div>

        <div className="toolbar-group">
          <select 
            onChange={(e) => executeCommand('foreColor', e.target.value)}
            title="Text Color"
          >
            <option value="">Text Color</option>
            <option value="#000000">Black</option>
            <option value="#e74c3c">Red</option>
            <option value="#3498db">Blue</option>
            <option value="#2ecc71">Green</option>
            <option value="#f39c12">Orange</option>
            <option value="#9b59b6">Purple</option>
          </select>
        </div>
      </div>

      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        suppressContentEditableWarning={true}
        style={{
          minHeight: '200px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '12px',
          outline: 'none',
          lineHeight: '1.6'
        }}
        placeholder={placeholder}
      />
      
      {!value && (
        <div className="editor-placeholder">
          {placeholder || 'Nhập nội dung...'}
        </div>
      )}
    </div>
  );
};

export default NativeRichTextEditor;