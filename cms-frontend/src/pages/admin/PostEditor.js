import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Autocomplete,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardMedia,
  IconButton,
} from '@mui/material';
import {
  Save,
  Publish,
  Preview,
  ExpandMore,
  Image as ImageIcon,
  Delete,
  Edit,
  AutoFixHigh,
} from '@mui/icons-material';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { useForm, Controller } from 'react-hook-form';
import slugify from 'slugify';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import MediaLibraryPicker from '../../components/MediaLibraryPicker';
import PDFViewer from '../../components/PDFViewer';

const PostEditor = () => {
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [error, setError] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [selectedFeaturedImage, setSelectedFeaturedImage] = useState(null);

  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      status: 'draft',
      post_type: 'post',
      category_id: '',
      comment_status: 'open',
      featured_image: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
    },
  });

  const watchedTitle = watch('title');
  const watchedContent = watch('content');

  useEffect(() => {
    fetchCategories();
    fetchTags();
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

  useEffect(() => {
    // Auto-generate slug from title
    if (watchedTitle && !isEditing) {
      const autoSlug = slugify(watchedTitle, { lower: true });
      setValue('slug', autoSlug);
    }
  }, [watchedTitle, isEditing, setValue]);

  const fetchCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const data = await apiService.getTags();
      setTags(data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const fetchPost = async () => {
    try {
      setLoadingPost(true);
      const post = await apiService.getPost(id);
      
      reset({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status,
        post_type: post.post_type,
        category_id: post.category_id || '',
        comment_status: post.comment_status,
        featured_image: post.featured_image || '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        meta_keywords: post.meta_keywords || '',
      });
      
      // Set editor state with post content
      setEditorState(htmlToEditorState(post.content));
      
      setSelectedTags(post.tags.map(tag => tag.name));
      
      // If post has featured image, try to find it in media library
      if (post.featured_image) {
        try {
          const media = await apiService.getMedia();
          const featuredMedia = media.find(m => m.url === post.featured_image);
          if (featuredMedia) {
            setSelectedFeaturedImage(featuredMedia);
          }
        } catch (error) {
          console.error('Failed to load featured image from media library:', error);
        }
      }
    } catch (error) {
      setError('Failed to load post');
    } finally {
      setLoadingPost(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const postData = {
        ...data,
        tags: selectedTags,
      };

      if (isEditing) {
        await apiService.updatePost(id, postData);
        toast.success('Post updated successfully');
      } else {
        await apiService.createPost(postData);
        toast.success('Post created successfully');
        navigate('/admin/posts');
      }
    } catch (error) {
      toast.error(isEditing ? 'Failed to update post' : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (data) => {
    console.log('=== PUBLISH DEBUG START ===');
    console.log('handlePublish called with:', data);
    console.log('Form errors:', errors);
    console.log('Selected tags:', selectedTags);
    console.log('Editor state content:', editorStateToHtml(editorState));
    console.log('Form validation state:', {
      isValid: Object.keys(errors).length === 0,
      errors: errors
    });
    
    // Check for required fields manually
    if (!data.title || !data.slug) {
      console.error('❌ Missing required fields:', { title: data.title, slug: data.slug });
      toast.error('Please fill in all required fields (Title and Slug)');
      return;
    }
    
    // Ensure content is properly set from the editor
    const currentContent = data.content || editorStateToHtml(editorState);
    console.log('Content validation:', {
      formContent: data.content,
      editorContent: editorStateToHtml(editorState),
      finalContent: currentContent,
      contentLength: currentContent?.length,
      isEmpty: !currentContent || currentContent.trim() === '<p></p>' || currentContent.trim() === ''
    });
    
    if (!currentContent || currentContent.trim() === '<p></p>' || currentContent.trim() === '') {
      console.error('❌ Content is empty');
      toast.error('Please add some content to your post');
      return;
    }
    
    const publishData = { 
      ...data, 
      content: currentContent,
      status: 'published', 
      tags: selectedTags 
    };
    console.log('✅ Publishing with data:', publishData);
    console.log('API call about to be made...');
    try {
      setLoading(true);
      if (isEditing) {
        console.log('🔄 Updating existing post...');
        const response = await apiService.updatePost(id, publishData);
        console.log('✅ Update response:', response);
        toast.success('Post published successfully');
      } else {
        console.log('🔄 Creating new post...');
        const response = await apiService.createPost(publishData);
        console.log('✅ Create response:', response);
        toast.success('Post published successfully');
        console.log('📍 Navigating to /admin/posts');
        navigate('/admin/posts');
      }
      console.log('=== PUBLISH DEBUG END: SUCCESS ===');
    } catch (error) {
      console.log('=== PUBLISH DEBUG END: ERROR ===');
      console.error('❌ Publish error full object:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
        console.error('❌ Response headers:', error.response.headers);
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to publish post';
      console.error('❌ Final error message:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      console.log('🏁 Publish process completed, loading state reset');
    }
  };

  const handleMediaSelect = (media) => {
    setSelectedFeaturedImage(media);
    setValue('featured_image', media.url);
  };

  const handleRemoveFeaturedImage = () => {
    setSelectedFeaturedImage(null);
    setValue('featured_image', '');
  };

  const generateSampleContent = async () => {
    try {
      // Fetch media from library for various file types
      const mediaResponse = await apiService.getMedia({ page: 1, per_page: 50 });
      const availableMedia = mediaResponse.media || [];
      
      const sampleTitles = [
        'The Future of Biotechnology in Medicine',
        'Advances in Metabolic Engineering for Sustainable Production',
        'Synthetic Biology: Programming Life for Innovation',
        'Fermentation Technology in Industrial Biotechnology',
        'CRISPR Gene Editing: Recent Breakthroughs and Applications',
        'Bioinformatics Tools for Modern Research',
        'Protein Engineering and Design Strategies',
        'Microbial Cell Factories for Biomanufacturing',
        'Systems Biology Approaches to Understanding Life',
        'Bioprocess Optimization for Commercial Scale Production'
      ];

      // Filter media by type
      const imageMedia = availableMedia.filter(media => 
        media.filename && (media.filename.toLowerCase().includes('.jpg') || 
        media.filename.toLowerCase().includes('.jpeg') || 
        media.filename.toLowerCase().includes('.png') || 
        media.filename.toLowerCase().includes('.gif') ||
        media.filename.toLowerCase().includes('.webp'))
      );
      
      const pdfMedia = availableMedia.filter(media => 
        media.filename && media.filename.toLowerCase().includes('.pdf')
      );
      
      const wordMedia = availableMedia.filter(media => 
        media.filename && (media.filename.toLowerCase().includes('.doc') || 
        media.filename.toLowerCase().includes('.docx'))
      );
      
      const downloadFiles = availableMedia.filter(media => 
        media.filename && (media.filename.toLowerCase().includes('.zip') || 
        media.filename.toLowerCase().includes('.xlsx') || 
        media.filename.toLowerCase().includes('.pptx') ||
        media.filename.toLowerCase().includes('.csv') ||
        media.filename.toLowerCase().includes('.txt'))
      );

      // Sample fallback URLs
      const fallbackImages = [
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
        'https://images.unsplash.com/photo-1576158114131-f211996e9137?w=800',
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ];

      // Get random media files
      let randomImage, randomPdf, randomWord, randomDownload;
      
      // Get random image
      if (imageMedia.length > 0) {
        const randomMedia = imageMedia[Math.floor(Math.random() * imageMedia.length)];
        randomImage = randomMedia.url;
        setSelectedFeaturedImage(randomMedia);
        setValue('featured_image', randomMedia.url);
      } else {
        randomImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
        setValue('featured_image', randomImage);
      }

      // Get specific PDF or fallback to random PDF
      const specificPdf = pdfMedia.find(media => media.url && media.url.includes('f0853e945c2a41b597772f0c87764fd4.pdf'));
      if (specificPdf) {
        randomPdf = specificPdf;
      } else if (pdfMedia.length > 0) {
        const randomPdfMedia = pdfMedia[Math.floor(Math.random() * pdfMedia.length)];
        randomPdf = randomPdfMedia;
      }

      // Get random Word document
      if (wordMedia.length > 0) {
        const randomWordMedia = wordMedia[Math.floor(Math.random() * wordMedia.length)];
        randomWord = randomWordMedia;
      }

      // Get random download file
      if (downloadFiles.length > 0) {
        const randomDownloadMedia = downloadFiles[Math.floor(Math.random() * downloadFiles.length)];
        randomDownload = randomDownloadMedia;
      }

      // Get video files from media library or use sample YouTube videos
      const videoMedia = availableMedia.filter(media => 
        media.filename && (media.filename.toLowerCase().includes('.mp4') || 
        media.filename.toLowerCase().includes('.webm') || 
        media.filename.toLowerCase().includes('.ogg') ||
        media.filename.toLowerCase().includes('.avi') ||
        media.filename.toLowerCase().includes('.mov'))
      );

      let videoHtml;
      if (videoMedia.length > 0) {
        const randomVideoMedia = videoMedia[Math.floor(Math.random() * videoMedia.length)];
        videoHtml = `
          <div style="margin: 20px 0; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background: #f5f5f5; padding: 12px; border-bottom: 1px solid #ddd;">
              <span style="color: #1976d2; font-weight: bold; margin-right: 10px;">🎬</span>
              <span style="font-weight: bold;">${randomVideoMedia.filename || 'Research Video'}</span>
            </div>
            <video controls style="width: 100%; height: auto; display: block;">
              <source src="${randomVideoMedia.url}" type="video/mp4">
              <source src="${randomVideoMedia.url}" type="video/webm">
              <source src="${randomVideoMedia.url}" type="video/ogg">
              Your browser does not support the video tag.
              <p>Video not supported. <a href="${randomVideoMedia.url}" target="_blank">Download video</a></p>
            </video>
          </div>`;
      } else {
        // Fallback to YouTube videos
        const sampleVideos = [
          'https://www.youtube.com/embed/dQw4w9WgXcQ',
          'https://www.youtube.com/embed/kJQP7kiw5Fk',
          'https://www.youtube.com/embed/oHg5SJYRHA0'
        ];
        const randomVideo = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
        videoHtml = `
          <div style="margin: 20px 0; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px;">
            <iframe src="${randomVideo}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe>
          </div>`;
      }

      // Build enhanced PDF content with research focus
      const pdfViewerHtml = randomPdf ? 
        `<h2>📚 Research Publication & Documentation</h2>
        <div style="margin: 20px 0; border: 2px solid #1976d2; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(25,118,210,0.15);">
          <div style="background: linear-gradient(135deg, #1976d2, #42a5f5); color: white; padding: 16px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 1.5em; margin-right: 12px;">📄</span>
              <div>
                <div style="font-weight: bold; font-size: 1.1em;">${randomPdf.filename || 'Research Document.pdf'}</div>
                <div style="opacity: 0.9; font-size: 0.9em;">Official Research Publication</div>
              </div>
            </div>
            <div style="opacity: 0.95; font-size: 0.95em; line-height: 1.4;">
              This document contains comprehensive research findings, methodological approaches, and detailed experimental results. 
              Key topics include advanced analytical techniques, innovative biotechnological applications, and future research directions.
            </div>
          </div>
          
          <div style="position: relative; background: #f8f9fa;">
            <iframe src="${randomPdf.url}#toolbar=1&navpanes=1&scrollbar=1&zoom=75" width="100%" height="700" frameborder="0" style="display: block; border: none;"></iframe>
            <div style="position: absolute; top: 10px; right: 10px; display: flex; gap: 8px;">
              <a href="/pdf/${randomPdf.filename || 'research-document.pdf'}?url=${encodeURIComponent(randomPdf.url)}&title=${encodeURIComponent(randomPdf.filename || 'Research Document')}" style="background: rgba(25,118,210,0.9); color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 0.9em; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 4px;">
                🔍 PDF Viewer
              </a>
              <a href="${randomPdf.url}" download style="background: rgba(76,175,80,0.9); color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 0.9em; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 4px;">
                ⬇️ Download
              </a>
            </div>
          </div>
          
          <div style="background: #e3f2fd; padding: 12px; border-top: 1px solid #bbdefb;">
            <div style="color: #1565c0; font-size: 0.9em; line-height: 1.4;">
              <strong>📋 Document Highlights:</strong> This research publication provides in-depth analysis of current methodologies, 
              experimental validation of key hypotheses, and comprehensive data supporting the presented conclusions. 
              The document serves as a foundational reference for understanding the latest developments in the field.
            </div>
          </div>
        </div>
        
        <h3 style="color: #1976d2; margin-top: 30px;">📖 Key Research Insights from the Document</h3>
        <div style="background: #f5f7ff; border-left: 4px solid #1976d2; padding: 20px; margin: 15px 0; border-radius: 0 8px 8px 0;">
          <ul style="line-height: 1.8; margin: 0; padding-left: 20px;">
            <li><strong>Methodological Innovation:</strong> The document presents novel approaches to data collection and analysis, incorporating cutting-edge technologies and statistical methods for biotechnology research.</li>
            <li><strong>Experimental Validation:</strong> Comprehensive experimental results validate the theoretical framework, with detailed protocols for fermentation optimization and protein engineering applications.</li>
            <li><strong>Practical Applications:</strong> Clear pathways for implementing research findings in industrial biotechnology, including scalability considerations for biomanufacturing processes.</li>
            <li><strong>Advanced Analytics:</strong> Integration of bioinformatics tools and machine learning algorithms for enhanced data interpretation and predictive modeling in biological systems.</li>
            <li><strong>Future Research Directions:</strong> Identification of emerging opportunities in synthetic biology, CRISPR applications, and sustainable bioprocess development.</li>
          </ul>
        </div>
        
        <h3 style="color: #2e7d32; margin-top: 25px;">🔬 Detailed Analysis Referenced in PDF</h3>
        <div style="background: #f1f8e9; border: 1px solid #c8e6c9; border-radius: 8px; padding: 20px; margin: 15px 0;">
          <p style="line-height: 1.7; margin-bottom: 15px;">
            The comprehensive research document provides extensive coverage of advanced biotechnological methodologies and their practical implementations. 
            Key sections include detailed experimental protocols, statistical analysis of results, and comparative studies with existing technologies.
          </p>
          <div style="background: white; border-left: 3px solid #4caf50; padding: 15px; margin: 15px 0;">
            <p style="margin: 0; font-style: italic; color: #2e7d32;">
              "This research represents a significant advancement in our understanding of metabolic engineering principles and their application 
              to sustainable biotechnology solutions. The methodologies presented here offer reproducible pathways for scaling laboratory 
              innovations to industrial applications." - Research Team Summary
            </p>
          </div>
          <p style="line-height: 1.7; margin-top: 15px;">
            For the complete methodology, detailed experimental procedures, and comprehensive results analysis, 
            <a href="/pdf/${randomPdf.filename || 'research-document.pdf'}?url=${encodeURIComponent(randomPdf.url)}&title=${encodeURIComponent('Comprehensive Research Publication')}" style="color: #1976d2; text-decoration: none; font-weight: bold;">
            refer to the full research publication ↗️</a> available through our integrated PDF viewer system.
          </p>
        </div>` : 
        '<h2>📚 Research Documentation</h2><div style="margin: 20px 0; padding: 30px; border: 2px dashed #1976d2; border-radius: 12px; text-align: center; background: #f5f7ff;"><div style="font-size: 3em; margin-bottom: 16px;">📄</div><p style="font-size: 1.1em; font-weight: bold; color: #1976d2; margin-bottom: 8px;">Advanced PDF Viewer</p><p style="color: #666; line-height: 1.6;">Comprehensive research documents and publications would be displayed here using our enhanced PDF viewing system when available in the media library. The viewer supports zooming, navigation, and full-screen viewing capabilities.</p></div>';

      // Build Word document HTML
      const wordDocHtml = randomWord ? 
        `<h2>Technical Report</h2><div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;"><p><strong>📄 Word Document:</strong> <a href="${randomWord.url}" target="_blank" style="color: #1976d2; text-decoration: none; font-weight: bold;">${randomWord.filename || 'Technical Report.docx'}</a></p><p style="margin-top: 10px; color: #666;">Click to view the full technical report with detailed methodology and findings.</p></div>` : 
        '<h2>Technical Report</h2><div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;"><p><strong>📄 Word Document:</strong> Technical reports would be available here when uploaded to the media library.</p></div>';

      // Build download file HTML
      const downloadFileHtml = randomDownload ? 
        `<h2>Additional Resources</h2><div style="margin: 20px 0; padding: 15px; border: 2px dashed #1976d2; border-radius: 8px; text-align: center;"><p><strong>📥 Download:</strong></p><a href="${randomDownload.url}" download style="display: inline-block; background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px;">${randomDownload.filename || 'Additional Resources'}</a><p style="margin-top: 10px; color: #666; font-size: 0.9em;">Click to download supplementary materials and datasets.</p></div>` : 
        '<h2>Additional Resources</h2><div style="margin: 20px 0; padding: 15px; border: 2px dashed #1976d2; border-radius: 8px; text-align: center;"><p><strong>📥 Download:</strong></p><p style="color: #666;">Downloadable resources would be available here when uploaded to the media library.</p></div>';

      // Build comprehensive sample data tables HTML
      const sampleTableHtml = `
        <h2>Research Data Analysis</h2>
        <div style="margin: 20px 0; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-family: Arial, sans-serif; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: linear-gradient(135deg, #1976d2, #42a5f5); color: white;">
                <th style="border: 1px solid #ddd; padding: 15px; text-align: left; font-weight: bold; font-size: 14px;">Sample ID</th>
                <th style="border: 1px solid #ddd; padding: 15px; text-align: center; font-weight: bold; font-size: 14px;">Concentration (mg/L)</th>
                <th style="border: 1px solid #ddd; padding: 15px; text-align: center; font-weight: bold; font-size: 14px;">pH Level</th>
                <th style="border: 1px solid #ddd; padding: 15px; text-align: center; font-weight: bold; font-size: 14px;">Temperature (°C)</th>
                <th style="border: 1px solid #ddd; padding: 15px; text-align: center; font-weight: bold; font-size: 14px;">Growth Rate (/h)</th>
                <th style="border: 1px solid #ddd; padding: 15px; text-align: center; font-weight: bold; font-size: 14px;">Efficiency (%)</th>
                <th style="border: 1px solid #ddd; padding: 15px; text-align: center; font-weight: bold; font-size: 14px;">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background-color: #f8f9fa;">
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #1976d2;">BT-001</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">125.5 ± 2.1</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">7.2</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">37.0</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">0.85</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">94.2</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;"><span style="background: #4caf50; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">Optimal</span></td>
              </tr>
              <tr style="background-color: #ffffff;">
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #1976d2;">BT-002</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">98.3 ± 1.8</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">6.8</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">35.5</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">0.72</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">87.6</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;"><span style="background: #ff9800; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">Good</span></td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #1976d2;">BT-003</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">142.7 ± 3.2</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">7.0</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">38.2</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">0.91</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">96.8</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;"><span style="background: #4caf50; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">Optimal</span></td>
              </tr>
              <tr style="background-color: #ffffff;">
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #1976d2;">BT-004</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">76.4 ± 2.9</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">6.5</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">33.8</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">0.58</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">73.5</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;"><span style="background: #f44336; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">Low</span></td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #1976d2;">BT-005</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">108.9 ± 1.5</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">7.1</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">36.7</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">0.79</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">91.3</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;"><span style="background: #ff9800; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">Good</span></td>
              </tr>
            </tbody>
            <tfoot>
              <tr style="background: #e3f2fd; font-weight: bold;">
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">Average</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">110.4 ± 2.1</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">6.9</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">36.2</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">0.77</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">88.7</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">-</td>
              </tr>
            </tfoot>
          </table>
          <p style="font-size: 0.9em; color: #666; font-style: italic; margin: 10px 0;">Table 1: Experimental results showing sample characteristics and growth performance under various controlled conditions.</p>
        </div>
        
        <h3 style="color: #2e7d32; margin-top: 30px;">Comparative Analysis Summary</h3>
        <div style="margin: 20px 0; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-family: Arial, sans-serif; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: linear-gradient(135deg, #2e7d32, #66bb6a); color: white;">
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Parameter</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">Minimum</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">Maximum</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">Mean ± SD</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">Optimal Range</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background-color: #f8f9fa;">
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #2e7d32;">Concentration (mg/L)</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">76.4</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">142.7</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">110.4 ± 25.8</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; background: #e8f5e8;">100-150</td>
              </tr>
              <tr style="background-color: #ffffff;">
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #2e7d32;">pH Level</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">6.5</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">7.2</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">6.9 ± 0.3</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; background: #e8f5e8;">6.8-7.2</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #2e7d32;">Temperature (°C)</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">33.8</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">38.2</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">36.2 ± 1.8</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; background: #e8f5e8;">35-38</td>
              </tr>
              <tr style="background-color: #ffffff;">
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #2e7d32;">Growth Rate (/h)</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">0.58</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">0.91</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">0.77 ± 0.13</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; background: #e8f5e8;">>0.75</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #2e7d32;">Efficiency (%)</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">73.5</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">96.8</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">88.7 ± 9.6</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; background: #e8f5e8;">>90</td>
              </tr>
            </tbody>
          </table>
          <p style="font-size: 0.9em; color: #666; font-style: italic; margin: 10px 0;">Table 2: Statistical summary of experimental parameters showing optimal operating ranges.</p>
        </div>
        
        <h3 style="color: #d32f2f; margin-top: 25px;">Performance Metrics Comparison</h3>
        <div style="margin: 20px 0; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-family: Arial, sans-serif; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: linear-gradient(135deg, #d32f2f, #f44336); color: white;">
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Sample</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">Yield (g/L)</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">Productivity (g/L/h)</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">Substrate Conversion (%)</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">Energy Efficiency</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">Cost Index</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background-color: #fff3e0;">
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #d32f2f;">BT-001</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">18.7</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">0.78</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">94.2</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">⭐⭐⭐⭐⭐</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; color: #4caf50; font-weight: bold;">Low</td>
              </tr>
              <tr style="background-color: #ffffff;">
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #d32f2f;">BT-002</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">15.3</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">0.64</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">87.6</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">⭐⭐⭐⭐</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; color: #ff9800; font-weight: bold;">Medium</td>
              </tr>
              <tr style="background-color: #fff3e0;">
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #d32f2f;">BT-003</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">21.4</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">0.89</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">96.8</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">⭐⭐⭐⭐⭐</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; color: #4caf50; font-weight: bold;">Low</td>
              </tr>
              <tr style="background-color: #ffffff;">
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #d32f2f;">BT-004</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">9.8</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">0.41</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">73.5</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">⭐⭐</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; color: #f44336; font-weight: bold;">High</td>
              </tr>
              <tr style="background-color: #fff3e0;">
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #d32f2f;">BT-005</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">16.9</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">0.70</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">91.3</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">⭐⭐⭐⭐</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; color: #ff9800; font-weight: bold;">Medium</td>
              </tr>
            </tbody>
          </table>
          <p style="font-size: 0.9em; color: #666; font-style: italic; margin: 10px 0;">Table 3: Performance metrics comparison showing yield, productivity, and economic indicators for each sample.</p>
        </div>
      `;

      // Build enhanced lists HTML
      const enhancedListsHtml = `
        <h2>Key Research Findings</h2>
        <div style="margin: 20px 0;">
          <h3 style="color: #1976d2; margin-bottom: 15px;">🔬 Primary Discoveries</h3>
          <ul style="line-height: 1.8; padding-left: 25px;">
            <li style="margin-bottom: 8px;"><strong>Enhanced Protein Expression:</strong> Successfully increased target protein production by 340% through optimized fermentation conditions</li>
            <li style="margin-bottom: 8px;"><strong>Metabolic Pathway Optimization:</strong> Identified and eliminated three bottleneck enzymes, improving overall pathway efficiency</li>
            <li style="margin-bottom: 8px;"><strong>Novel Biomarker Discovery:</strong> Characterized 12 new metabolic indicators for real-time process monitoring</li>
            <li style="margin-bottom: 8px;"><strong>Temperature Stability:</strong> Achieved 95% protein activity retention at elevated temperatures (up to 65°C)</li>
          </ul>
          
          <h3 style="color: #1976d2; margin: 25px 0 15px 0;">⚗️ Methodology Highlights</h3>
          <ul style="line-height: 1.8; padding-left: 25px;">
            <li style="margin-bottom: 8px;"><strong>Advanced Analytics:</strong>
              <ul style="margin-top: 8px; margin-bottom: 8px; padding-left: 20px;">
                <li style="margin-bottom: 5px;">High-resolution mass spectrometry (HRMS) analysis</li>
                <li style="margin-bottom: 5px;">Real-time PCR quantification</li>
                <li style="margin-bottom: 5px;">Multi-dimensional NMR spectroscopy</li>
                <li style="margin-bottom: 5px;">Flow cytometry cell analysis</li>
              </ul>
            </li>
            <li style="margin-bottom: 8px;"><strong>Computational Modeling:</strong>
              <ul style="margin-top: 8px; margin-bottom: 8px; padding-left: 20px;">
                <li style="margin-bottom: 5px;">Molecular dynamics simulations</li>
                <li style="margin-bottom: 5px;">Machine learning prediction algorithms</li>
                <li style="margin-bottom: 5px;">Statistical process optimization</li>
                <li style="margin-bottom: 5px;">Kinetic parameter estimation</li>
              </ul>
            </li>
            <li style="margin-bottom: 8px;"><strong>Quality Control Measures:</strong>
              <ul style="margin-top: 8px; padding-left: 20px;">
                <li style="margin-bottom: 5px;">Triple biological replicates for all experiments</li>
                <li style="margin-bottom: 5px;">Standardized protocols across all research phases</li>
                <li style="margin-bottom: 5px;">Independent verification by external laboratories</li>
                <li style="margin-bottom: 5px;">Comprehensive data validation procedures</li>
              </ul>
            </li>
          </ul>

          <h3 style="color: #1976d2; margin: 25px 0 15px 0;">🎯 Future Applications</h3>
          <ol style="line-height: 1.8; padding-left: 25px;">
            <li style="margin-bottom: 8px;"><strong>Pharmaceutical Industry:</strong> Scale-up for therapeutic protein production and drug development pipelines</li>
            <li style="margin-bottom: 8px;"><strong>Industrial Biotechnology:</strong> Implementation in large-scale biomanufacturing facilities for sustainable chemical production</li>
            <li style="margin-bottom: 8px;"><strong>Environmental Applications:</strong> Deployment in bioremediation projects and waste treatment systems</li>
            <li style="margin-bottom: 8px;"><strong>Agricultural Biotechnology:</strong> Development of enhanced crop protection and soil improvement solutions</li>
            <li style="margin-bottom: 8px;"><strong>Food Technology:</strong> Integration into food processing and preservation systems for improved safety and shelf-life</li>
          </ol>
        </div>
      `;

      const sampleContent = [
        `<p>This article explores the cutting-edge developments in biotechnology and their transformative impact on various industries.</p><img src="${randomImage}" alt="Biotechnology research" style="width: 100%; height: auto; margin: 20px 0;" /><h2>Introduction</h2><p>In recent years, biotechnology has emerged as one of the most promising fields for addressing global challenges. From healthcare to environmental sustainability, the applications are vast and revolutionary.</p>${enhancedListsHtml}<h2>Research Video</h2>${videoHtml}${pdfViewerHtml}${sampleTableHtml}${wordDocHtml}${downloadFileHtml}<h2>Future Perspectives</h2><p>Looking ahead, we can expect continued innovation and integration of biotechnological solutions across multiple sectors. The potential for positive impact on society remains immense.</p><p>Stay tuned for more insights and developments in this exciting field!</p>`,
        
        `<p>Understanding the mechanisms and applications of advanced biological systems in modern research and industry.</p><h2>Overview</h2><p>The intersection of biology and technology continues to yield remarkable innovations that are reshaping our understanding of life itself.</p><img src="${randomImage}" alt="Laboratory equipment" style="width: 100%; height: auto; margin: 20px 0;" /><h2>Technical Insights</h2><p>Key areas of focus include advanced analytical techniques and computational approaches:</p>${enhancedListsHtml}<blockquote><p>"Science is not only a disciple of reason but, also, one of romance and passion." - Stephen Hawking</p></blockquote><h2>Video Tutorial</h2>${videoHtml}${wordDocHtml}${sampleTableHtml}${pdfViewerHtml}<h2>Applications</h2><p>These technologies find applications in pharmaceuticals, agriculture, environmental science, and beyond. The potential for creating positive change is limitless.</p>${downloadFileHtml}<h2>Conclusion</h2><p>As we continue to push the boundaries of what's possible, interdisciplinary collaboration remains key to unlocking new possibilities.</p>`,
        
        `<p>An in-depth exploration of innovative approaches and methodologies in contemporary scientific research.</p><h2>Research Background</h2><p>This study examines the latest developments and their implications for future research directions.</p><img src="${randomImage}" alt="Scientific research" style="width: 100%; height: auto; margin: 20px 0;" />${downloadFileHtml}<h2>Methodology</h2><p>Our comprehensive research approach incorporated multiple analytical techniques and quality control measures:</p>${enhancedListsHtml}${wordDocHtml}<h2>Results and Discussion</h2><p>The findings reveal significant potential for advancing our understanding of complex biological systems. Key insights include improved efficiency, enhanced accuracy, and broader applicability of developed methods.</p>${sampleTableHtml}<h2>Research Demonstration</h2>${videoHtml}${pdfViewerHtml}<h2>Future Work</h2><p>Continued research in this area will focus on optimization, scalability, and real-world implementation of these innovative approaches.</p>`
      ];

      // Sample tags
      const sampleTagNames = [
        'biotechnology', 'research', 'innovation', 'science', 'laboratory',
        'molecular biology', 'genetics', 'bioengineering', 'pharmaceuticals',
        'synthetic biology', 'CRISPR', 'protein engineering', 'fermentation',
        'bioinformatics', 'systems biology', 'metabolic engineering'
      ];

      // Select 3-5 random tags
      const numberOfTags = Math.floor(Math.random() * 3) + 3; // 3-5 tags
      const selectedTagNames = [];
      
      for (let i = 0; i < numberOfTags; i++) {
        const randomTag = sampleTagNames[Math.floor(Math.random() * sampleTagNames.length)];
        if (!selectedTagNames.includes(randomTag)) {
          selectedTagNames.push(randomTag);
        }
      }

      // Find existing tags or create tag objects
      const existingTags = tags.filter(tag => selectedTagNames.includes(tag.name));
      const newTagNames = selectedTagNames.filter(name => !existingTags.some(tag => tag.name === name));
      
      // Create tag objects for new tags
      const newTags = newTagNames.map((name, index) => ({
        id: `temp_${index}`,
        name: name
      }));

      const allSelectedTags = [...existingTags, ...newTags];
      // Convert to string array for Autocomplete compatibility
      const tagNames = allSelectedTags.map(tag => tag.name);
      setSelectedTags(tagNames);

      const randomTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
      const randomContent = sampleContent[Math.floor(Math.random() * sampleContent.length)];
      const slug = slugify(randomTitle, { lower: true, strict: true });
      const excerpt = 'This is a comprehensive sample post generated to demonstrate the full content management system capabilities. It includes various formatting elements, images, videos, PDF documents, Word files, downloadable resources, data tables, enhanced lists with nested structures, and professional layouts commonly found in scientific and technical blog posts.';

      // Set all form values
      console.log('Setting form values:', { randomTitle, slug, randomContent: randomContent.length }); // Debug log
      setValue('title', randomTitle, { shouldValidate: true });
      setValue('slug', slug, { shouldValidate: true });
      setValue('content', randomContent, { shouldValidate: true });
      setValue('excerpt', excerpt, { shouldValidate: true });
      
      // Update Draft.js editor with the new content
      setEditorState(htmlToEditorState(randomContent));
      
      // Trigger form validation to ensure all fields are properly validated
      await trigger(['title', 'slug', 'content']);
      
      console.log('Form values set, current watch values:', { 
        title: watch('title'), 
        slug: watch('slug'), 
        content: watch('content')?.length 
      }); // Debug log
      
      // Set default values for required fields if not already set
      if (!watch('status')) {
        setValue('status', 'draft');
      }
      if (!watch('post_type')) {
        setValue('post_type', 'post');
      }
      if (!watch('comment_status')) {
        setValue('comment_status', 'open');
      }
      
      // Trigger form validation after setting all values
      setTimeout(() => {
        console.log('Triggering form validation...'); // Debug log
        trigger(['title', 'slug']);
      }, 100);
      
      toast.success('AI-generated sample content created successfully with media, documents, tables, lists, and tags!');
    } catch (error) {
      console.error('Error generating sample content:', error);
      toast.error('Failed to generate AI sample content. Please try again.');
    }
  };

  // Store TinyMCE editor instance
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // Handle media selection from media library for content insertion
  const handleContentMediaSelect = (media) => {
    // For React Draft Wysiwyg, we'll handle image insertion through the image toolbar button
    // User can paste the image URL or use the built-in image functionality
    console.log('Media selected:', media.url);
    setMediaPickerOpen(false);
  };


  // React Draft Wysiwyg configuration
  const editorToolbarConfig = {
    options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'image', 'remove', 'history'],
    inline: {
      inDropdown: false,
      className: undefined,
      component: undefined,
      dropdownClassName: undefined,
      options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace', 'superscript', 'subscript']
    },
    blockType: {
      inDropdown: true,
      options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code']
    },
    fontSize: {
      options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96]
    },
    fontFamily: {
      options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana']
    },
    list: {
      inDropdown: false,
      className: undefined,
      component: undefined,
      dropdownClassName: undefined,
      options: ['unordered', 'ordered', 'indent', 'outdent']
    },
    textAlign: {
      inDropdown: false,
      className: undefined,
      component: undefined,
      dropdownClassName: undefined,
      options: ['left', 'center', 'right', 'justify']
    },
    colorPicker: {
      icon: undefined,
      className: undefined,
      component: undefined,
      popupClassName: undefined,
      colors: ['rgb(97,189,109)', 'rgb(26,188,156)', 'rgb(84,172,210)', 'rgb(44,130,201)',
        'rgb(147,101,184)', 'rgb(71,85,119)', 'rgb(204,204,204)', 'rgb(65,168,95)', 'rgb(0,168,133)',
        'rgb(61,142,185)', 'rgb(41,105,176)', 'rgb(85,57,130)', 'rgb(40,50,78)', 'rgb(0,0,0)',
        'rgb(247,218,100)', 'rgb(251,160,38)', 'rgb(235,107,86)', 'rgb(226,80,65)', 'rgb(163,143,132)',
        'rgb(239,239,239)', 'rgb(255,255,255)', 'rgb(250,197,28)', 'rgb(243,121,52)', 'rgb(209,72,65)',
        'rgb(184,49,47)', 'rgb(124,112,107)', 'rgb(209,213,216)']
    },
    link: {
      inDropdown: false,
      className: undefined,
      component: undefined,
      popupClassName: undefined,
      dropdownClassName: undefined,
      showOpenOptionOnHover: true,
      defaultTargetOption: '_self',
      options: ['link', 'unlink'],
      linkCallback: undefined
    },
    embedded: {
      icon: undefined,
      className: undefined,
      component: undefined,
      popupClassName: undefined,
      embedCallback: undefined,
      defaultSize: {
        height: 'auto',
        width: 'auto'
      }
    },
    image: {
      icon: undefined,
      className: undefined,
      component: undefined,
      popupClassName: undefined,
      urlEnabled: true,
      uploadEnabled: false,
      alignmentEnabled: true,
      uploadCallback: undefined,
      previewImage: false,
      inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
      alt: { present: false, mandatory: false },
      defaultSize: {
        height: 'auto',
        width: 'auto'
      }
    },
    remove: { icon: undefined, className: undefined, component: undefined },
    history: {
      inDropdown: false,
      className: undefined,
      component: undefined,
      dropdownClassName: undefined,
      options: ['undo', 'redo']
    }
  };

  // Convert HTML to Draft.js EditorState
  const htmlToEditorState = (html) => {
    if (!html) return EditorState.createEmpty();
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  };

  // Convert Draft.js EditorState to HTML
  const editorStateToHtml = (editorState) => {
    return draftToHtml(convertToRaw(editorState.getCurrentContent()));
  };

  if (loadingPost) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {isEditing ? 'Edit Post' : 'Create New Post'}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={previewMode}
              onChange={(e) => setPreviewMode(e.target.checked)}
            />
          }
          label="Preview Mode"
        />
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AutoFixHigh />}
                  onClick={generateSampleContent}
                  sx={{ mb: 2 }}
                >
                  AI Generate Sample Content
                </Button>
              </Box>

              <TextField
                fullWidth
                label="Title"
                {...register('title', { required: 'Title is required' })}
                error={!!errors.title}
                helperText={errors.title?.message}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Slug"
                {...register('slug', { required: 'Slug is required' })}
                error={!!errors.slug}
                helperText={errors.slug?.message || 'URL-friendly version of the title'}
                sx={{ mb: 3 }}
              />


              {previewMode ? (
                <Box
                  sx={{
                    minHeight: 300,
                    p: 2,
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1 },
                    '& p': { mb: 1 },
                    '& ul, & ol': { pl: 2 },
                  }}
                  dangerouslySetInnerHTML={{ __html: watchedContent }}
                />
              ) : (
                <>
                  <Controller
                    name="content"
                    control={control}
                    rules={{ required: 'Content is required' }}
                    render={({ field }) => (
                      <Box sx={{ 
                        position: 'relative',
                        border: '1px solid #ddd',
                        borderRadius: 1,
                        minHeight: 400,
                        '& .rdw-editor-wrapper': {
                          border: 'none'
                        },
                        '& .rdw-editor-main': {
                          minHeight: 350,
                          padding: '16px'
                        }
                      }}>
                        <Editor
                          editorState={editorState}
                          wrapperClassName="demo-wrapper"
                          editorClassName="demo-editor"
                          toolbarClassName="demo-toolbar"
                          toolbar={editorToolbarConfig}
                          onEditorStateChange={(newEditorState) => {
                            setEditorState(newEditorState);
                            const html = editorStateToHtml(newEditorState);
                            field.onChange(html);
                          }}
                          placeholder="Write your blog content here..."
                        />
                      </Box>
                    )}
                  />
                </>
              )}

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Excerpt"
                {...register('excerpt')}
                helperText="Optional. If left blank, one will be generated from content."
                sx={{ mt: 3 }}
              />
            </Paper>

            {/* SEO Settings */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">SEO Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    label="Meta Title"
                    {...register('meta_title')}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Meta Description"
                    {...register('meta_description')}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Meta Keywords"
                    {...register('meta_keywords')}
                    helperText="Comma-separated keywords"
                  />
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Publish Box */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Publish
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  {...register('status')}
                  defaultValue="draft"
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Post Type</InputLabel>
                <Select
                  {...register('post_type')}
                  defaultValue="post"
                  label="Post Type"
                >
                  <MenuItem value="post">Post</MenuItem>
                  <MenuItem value="page">Page</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Comments</InputLabel>
                <Select
                  {...register('comment_status')}
                  defaultValue="open"
                  label="Comments"
                >
                  <MenuItem value="open">Allow Comments</MenuItem>
                  <MenuItem value="closed">Disable Comments</MenuItem>
                </Select>
              </FormControl>

              <Box display="flex" gap={1} flexDirection="column">
                <Button
                  type="submit"
                  variant="outlined"
                  startIcon={<Save />}
                  disabled={loading}
                  fullWidth
                >
                  Save Draft
                </Button>
                <Button
                  onClick={(e) => {
                    console.log('🔘 PUBLISH BUTTON CLICKED');
                    console.log('📋 Current form data:', watch());
                    console.log('❌ Current form errors:', errors);
                    console.log('📝 Editor state:', editorState);
                    console.log('🏷️ Selected tags:', selectedTags);
                    console.log('🔄 About to call handleSubmit(handlePublish)');
                    
                    const result = handleSubmit(handlePublish)(e);
                    console.log('📤 handleSubmit result:', result);
                  }}
                  variant="contained"
                  startIcon={<Publish />}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={20} /> : 'Publish'}
                </Button>
              </Box>
            </Paper>

            {/* Categories */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Category
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <FormControl fullWidth>
                <InputLabel>Select Category</InputLabel>
                <Select
                  {...register('category_id')}
                  label="Select Category"
                >
                  <MenuItem value="">None</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            {/* Tags */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tags
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Autocomplete
                multiple
                options={tags.map(tag => tag.name)}
                value={selectedTags}
                onChange={(event, newValue) => setSelectedTags(newValue)}
                freeSolo
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={index}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Add tags..."
                    helperText="Type and press Enter to add"
                  />
                )}
              />
            </Paper>

            {/* Featured Image */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Featured Image
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {selectedFeaturedImage ? (
                <Box>
                  <Card sx={{ mb: 2 }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={selectedFeaturedImage.url}
                      alt={selectedFeaturedImage.alt_text || selectedFeaturedImage.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="textSecondary">
                        {selectedFeaturedImage.title}
                      </Typography>
                      <Box>
                        <IconButton 
                          size="small" 
                          onClick={() => setMediaPickerOpen(true)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={handleRemoveFeaturedImage}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
                </Box>
              ) : (
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<ImageIcon />}
                    fullWidth
                    onClick={() => setMediaPickerOpen(true)}
                    sx={{ mb: 2 }}
                  >
                    Choose from Media Library
                  </Button>
                  
                  {/* Fallback URL input for external images */}
                  <Typography variant="caption" color="textSecondary" gutterBottom display="block">
                    Or enter external image URL:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Image URL"
                    {...register('featured_image')}
                    onChange={(e) => {
                      // Clear selected media if URL is manually entered
                      if (e.target.value && selectedFeaturedImage) {
                        setSelectedFeaturedImage(null);
                      }
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </form>

      {/* Media Library Picker */}
      <MediaLibraryPicker
        open={mediaPickerOpen}
        onClose={() => {
          setMediaPickerOpen(false);
          window.tinymceCallback = null; // Clear callback if cancelled
        }}
        onSelect={window.tinymceCallback ? handleContentMediaSelect : handleMediaSelect}
        selectedMedia={selectedFeaturedImage}
        allowedTypes={['image']}
        title={window.tinymceCallback ? "Insert Image" : "Select Featured Image"}
      />
    </Box>
  );
};

export default PostEditor;