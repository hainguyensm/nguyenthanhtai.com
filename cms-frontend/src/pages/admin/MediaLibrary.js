import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

const MediaLibrary = () => {
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState([]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Media Library</Typography>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          component="label"
        >
          Upload Files
          <input type="file" hidden multiple />
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {media.length === 0 ? (
            <Grid item xs={12}>
              <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
                No media files found. Upload some files to get started.
              </Typography>
            </Grid>
          ) : (
            media.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={item.url}
                    alt={item.title}
                  />
                  <CardContent>
                    <Typography variant="body2" color="textSecondary">
                      {item.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default MediaLibrary;