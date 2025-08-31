import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Comments = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Comments</Typography>
    <Paper sx={{ p: 3 }}>
      <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
        Comments management will be implemented here.
      </Typography>
    </Paper>
  </Box>
);

export default Comments;