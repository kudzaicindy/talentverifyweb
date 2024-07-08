import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deleteEmployee } from '../../services/api';
import { 
  Box, 
  Button, 
  Typography, 
  Snackbar, 
  Container, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle 
} from '@mui/material';
import Alert from '@mui/material/Alert';

const DeleteCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(true);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    navigate('/companies');
  };

  const handleDelete = async () => {
    setError('');
    setSuccess('');

    try {
      await DeleteCompany(id);
      setSuccess('Company deleted successfully');
      setTimeout(() => navigate('/companies'), 2000);
    } catch (error) {
      setError(`Error deleting companies: ${error.response?.data?.error || error.message}`);
    }
    setOpenDialog(false);
  };

  return (
    <Container maxWidth="md">
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Company Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this company? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" autoFocus>
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error || !!success} autoHideDuration={6000} onClose={() => { setError(''); setSuccess(''); }}>
        <Alert onClose={() => { setError(''); setSuccess(''); }} severity={error ? "error" : "success"} variant="filled">
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DeleteCompany;