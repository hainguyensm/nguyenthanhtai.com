import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Users = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Users</Typography>
    <Paper sx={{ p: 3 }}>
      <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
        User management will be implemented here.
      </Typography>
    </Paper>
  </Box>
);

export default Users;