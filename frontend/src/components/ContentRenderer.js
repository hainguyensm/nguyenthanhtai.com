import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ContentRenderer.css';

const ContentRenderer = ({ content }) => {
  // Check if content is HTML (contains HTML tags)
  const isHTML = /<[a-z][\s\S]*>/i.test(content);
  
  if (isHTML) {
    // Render HTML content
    return (
      <div 
        className="content-renderer html-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  } else {
    // Render Markdown content
    return (
      <div className="content-renderer markdown-content">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }
};

export default ContentRenderer;