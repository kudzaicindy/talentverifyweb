import React, { useState } from 'react';
import { createCompany } from '../../services/api';
import { Box, TextField, Button, Typography, Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';

const AddCompany = ({ onCompanyAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    registration_date: '',
    registration_number: '',
    address: '',
    contact_person: '',
    contact_phone: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formattedData = {
      ...formData,
      registration_date: formData.registration_date ? new Date(formData.registration_date).toISOString().split('T')[0] : ''
    };

    try {
      const response = await createCompany(formattedData);
      setSuccess('Company added successfully');
      setFormData({
        name: '',
        registration_date: '',
        registration_number: '',
        address: '',
        contact_person: '',
        contact_phone: '',
        email: ''
      });
      if (onCompanyAdded) {
        onCompanyAdded(response.data);
      }
    } catch (error) {
      setError(`Error adding company: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}>
      <Typography variant="h6" gutterBottom>Add New Company</Typography>
      <Box>
        <TextField
          name="name"
          label="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <TextField
          name="registration_date"
          label="Registration Date"
          type="date"
          value={formData.registration_date}
          onChange={handleChange}
          required
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          name="registration_number"
          label="Registration Number"
          value={formData.registration_number}
          onChange={handleChange}
          required
        />
      </Box>
      <Box>
        <TextField
          name="address"
          label="Address"
          value={formData.address}
          onChange={handleChange}
          required
        />
        <TextField
          name="contact_person"
          label="Contact Person"
          value={formData.contact_person}
          onChange={handleChange}
          required
        />
        <TextField
          name="contact_phone"
          label="Contact Phone"
          value={formData.contact_phone}
          onChange={handleChange}
          required
        />
      </Box>
      <Box>
        <TextField
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Box>
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>Add Company</Button>
      <Snackbar open={!!error || !!success} autoHideDuration={6000} onClose={() => { setError(''); setSuccess(''); }}>
        <Alert onClose={() => { setError(''); setSuccess(''); }} severity={error ? "error" : "success"} variant="filled">
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddCompany;