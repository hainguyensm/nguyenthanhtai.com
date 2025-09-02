import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  Download,
  Fullscreen,
  NavigateBefore,
  NavigateNext,
  Refresh,
} from '@mui/icons-material';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = ({ url, filename = 'document.pdf', height = 600 }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF document');
    setLoading(false);
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => Math.max(1, Math.min(prevPageNumber + offset, numPages || 1)));
  };

  const changeScale = (delta) => {
    setScale(prevScale => Math.max(0.5, Math.min(prevScale + delta, 3.0)));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFullscreen = () => {
    window.open(url, '_blank');
  };

  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          onClick={handleDownload}
          startIcon={<Download />}
        >
          Download PDF Instead
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ overflow: 'hidden' }}>
      {/* PDF Controls Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #ddd',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            📄 {filename}
          </Typography>
          {numPages && (
            <Typography variant="caption" color="text.secondary">
              (Page {pageNumber} of {numPages})
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Navigation Controls */}
          <Tooltip title="Previous Page">
            <span>
              <IconButton
                onClick={() => changePage(-1)}
                disabled={pageNumber <= 1}
                size="small"
              >
                <NavigateBefore />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Next Page">
            <span>
              <IconButton
                onClick={() => changePage(1)}
                disabled={pageNumber >= (numPages || 1)}
                size="small"
              >
                <NavigateNext />
              </IconButton>
            </span>
          </Tooltip>

          {/* Zoom Controls */}
          <Tooltip title="Zoom Out">
            <IconButton
              onClick={() => changeScale(-0.2)}
              disabled={scale <= 0.5}
              size="small"
            >
              <ZoomOut />
            </IconButton>
          </Tooltip>

          <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </Typography>

          <Tooltip title="Zoom In">
            <IconButton
              onClick={() => changeScale(0.2)}
              disabled={scale >= 3.0}
              size="small"
            >
              <ZoomIn />
            </IconButton>
          </Tooltip>

          {/* Action Buttons */}
          <Tooltip title="Refresh">
            <IconButton onClick={() => window.location.reload()} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>

          <Tooltip title="Open in New Tab">
            <IconButton onClick={handleFullscreen} size="small">
              <Fullscreen />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            size="small"
            onClick={handleDownload}
            startIcon={<Download />}
            sx={{ ml: 1 }}
          >
            Download
          </Button>
        </Box>
      </Box>

      {/* PDF Content */}
      <Box
        sx={{
          height: height,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: loading ? 'center' : 'flex-start',
          backgroundColor: '#f0f0f0',
          p: 2,
        }}
      >
        {loading && (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Loading PDF...
            </Typography>
          </Box>
        )}

        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading=""
          error=""
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        </Document>
      </Box>

      {/* Footer Info */}
      <Box
        sx={{
          p: 1,
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid #ddd',
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Use mouse wheel or zoom controls to adjust size • Click Download for full document
        </Typography>
      </Box>
    </Paper>
  );
};

export default PDFViewer;