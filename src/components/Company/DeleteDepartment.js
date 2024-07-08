import React, { useState } from 'react';
import { Button, Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';
import { deleteDepartment } from '../../services/api';

const DeleteDepartment = ({ companyId, departmentId, onDepartmentDeleted }) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDelete = async () => {
    setError('');
    setSuccess('');

    try {
      await deleteDepartment(companyId, departmentId);
      setSuccess('Department deleted successfully');
      if (onDepartmentDeleted) {
        onDepartmentDeleted(departmentId);
      }
    } catch (error) {
      console.error('Delete error:', error.response || error);
      setError(`Error deleting department: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <>
      <Button variant="outlined" color="error" onClick={handleDelete}>
        Delete
      </Button>
      <Snackbar open={!!error || !!success} autoHideDuration={6000} onClose={() => { setError(''); setSuccess(''); }}>
        <Alert onClose={() => { setError(''); setSuccess(''); }} severity={error ? "error" : "success"} variant="filled">
          {error || success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DeleteDepartment;