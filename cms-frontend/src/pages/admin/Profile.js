import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Profile = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Profile</Typography>
    <Paper sx={{ p: 3 }}>
      <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
        User profile management will be implemented here.
      </Typography>
    </Paper>
  </Box>
);

export default Profile;