import React from 'react';
import { Alert, Collapse, Box } from '@mui/material';

export default function ErrorMessage({ message, open = false, setOpen }) {
  return (
    <Box display={open ? 'flex':'none'} justifyContent={"center"} sx={{ width: '100%', mt: 2, mb: 2 }}>
      <Collapse in={open}>
        <Alert 
          severity="error" 
          variant="filled" 
          onClose={() => setOpen(false)} 
          sx={{ borderRadius: '10px' }}
        >
          {message}
        </Alert>
      </Collapse>
    </Box>
  );
}