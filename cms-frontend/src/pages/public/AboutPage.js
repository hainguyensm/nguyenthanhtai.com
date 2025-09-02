import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const AboutPage = () => {
  return (
    <Container maxWidth={false} sx={{ py: 6, px: 3 }}>
      <Paper elevation={1} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          About Us
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          Welcome to our content management system! This is a powerful, modern CMS built with 
          React and Flask that provides a complete solution for managing your website content.
        </Typography>

        <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}>
          Features
        </Typography>
        
        <Typography component="div" sx={{ fontSize: '1rem', lineHeight: 1.7 }}>
          <ul>
            <li>Rich text editor for creating engaging content</li>
            <li>User management with role-based permissions</li>
            <li>Media library for managing images and files</li>
            <li>Category and tag organization</li>
            <li>SEO-friendly URLs and metadata</li>
            <li>Responsive design that works on all devices</li>
            <li>Fast and secure backend API</li>
            <li>Modern React frontend with Material-UI</li>
          </ul>
        </Typography>

        <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}>
          Technology Stack
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          Our CMS is built using modern web technologies:
        </Typography>
        
        <Typography component="div" sx={{ fontSize: '1rem', lineHeight: 1.7 }}>
          <ul>
            <li><strong>Frontend:</strong> React, Material-UI, React Router</li>
            <li><strong>Backend:</strong> Flask, SQLAlchemy, JWT Authentication</li>
            <li><strong>Database:</strong> SQLite (easily configurable for PostgreSQL/MySQL)</li>
            <li><strong>Rich Text:</strong> ReactQuill editor</li>
          </ul>
        </Typography>

        <Box sx={{ mt: 4, p: 3, backgroundColor: 'primary.main', color: 'white', borderRadius: 1 }}>
          <Typography variant="h5" gutterBottom>
            Get Started
          </Typography>
          <Typography>
            Ready to create amazing content? Contact our admin team to get access to the CMS 
            or explore our published articles to see what's possible.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutPage;