import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompany, updateCompany } from '../../services/api';
import { Box, TextField, Button, Typography, Snackbar, Container } from '@mui/material';
import Alert from '@mui/material/Alert';

const UpdateCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await getCompany(id);
        setFormData(response.data);
      } catch (error) {
        setError(`Error fetching company data: ${error.response?.data?.error || error.message}`);
      }
    };

    fetchCompany();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await updateCompany(id, formData);
      setSuccess('Company updated successfully');
      setTimeout(() => navigate('/companies'), 2000);
    } catch (error) {
      setError(`Error updating company: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <Container>
      <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}>
        <Typography variant="h6" gutterBottom>Update Company</Typography>
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
          <TextField
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Box>
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Update Company</Button>
      </Box>
      <Snackbar open={!!error || !!success} autoHideDuration={6000} onClose={() => { setError(''); setSuccess(''); }}>
        <Alert onClose={() => { setError(''); setSuccess(''); }} severity={error ? "error" : "success"} variant="filled">
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UpdateCompany;