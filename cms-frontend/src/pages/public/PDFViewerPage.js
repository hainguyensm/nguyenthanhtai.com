import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Container, Box, Breadcrumbs, Typography, Link } from '@mui/material';
import { Home, Description } from '@mui/icons-material';
import PDFViewer from '../../components/PDFViewer';

const PDFViewerPage = () => {
  const { filename } = useParams();
  const [searchParams] = useSearchParams();
  const url = searchParams.get('url');
  const title = searchParams.get('title') || filename || 'Document';

  if (!url) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" color="error" textAlign="center">
          No PDF URL provided
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          component="a"
          href="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': { color: 'primary.main' }
          }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Typography 
          color="text.primary" 
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Description sx={{ mr: 0.5 }} fontSize="inherit" />
          {title}
        </Typography>
      </Breadcrumbs>

      {/* Page Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          📄 PDF Viewer
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
      </Box>

      {/* PDF Viewer */}
      <PDFViewer 
        url={url} 
        filename={filename || 'document.pdf'} 
        height={800} 
      />
    </Container>
  );
};

export default PDFViewerPage;