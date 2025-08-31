import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Settings = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Settings</Typography>
    <Paper sx={{ p: 3 }}>
      <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
        Site settings will be implemented here.
      </Typography>
    </Paper>
  </Box>
);

export default Settings;