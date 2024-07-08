import React, { useState } from 'react';
import { bulkUpload } from '../../services/api';
import {
  Button,
  Container,
  Typography,
  TextField,
  Snackbar,
  CircularProgress,
  Box,
} from '@mui/material';
import Alert from '@mui/material/Alert';

function BulkUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [companyId, setCompanyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !companyId) {
      setMessage('Please select a file and enter a company ID');
      setSeverity('error');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('company', companyId);
      const response = await bulkUpload(formData);
      setMessage(response.data.message || 'Bulk upload successful');
      setSeverity('success');
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Bulk upload failed:', error);
      setMessage(error.response?.data?.error || 'Bulk upload failed');
      setSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h6" gutterBottom>
        Bulk Upload
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box mb={2}>
          <input
            type="file"
            accept=".csv,.xlsx,.txt,.json"
            onChange={handleFileChange}
          />
        </Box>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label="Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload'}
        </Button>
      </form>
      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setMessage('')} severity={severity} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default BulkUpload;
