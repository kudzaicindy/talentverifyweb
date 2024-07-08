import React, { useState } from 'react';
import { createEmployee } from '../../services/api';
import { Box, TextField, Button, Typography, Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';

const AddEmployee = ({ onEmployeeAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    department: '',
    employee_id: '',
    role: '',
    start_date: '',
    end_date: '',
    phone_number: '',
    email: '',
    position: ''
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

    // Ensure dates are in YYYY-MM-DD format
    const formattedData = {
      ...formData,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString().split('T')[0] : '',
      end_date: formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : null
    
    };

    try {
      const response = await createEmployee(formattedData);
      setSuccess('Employee added successfully');
      setFormData({
        name: '',
        company: '',
        department: '',
        employee_id: '',
        role: '',
        start_date: '',
        end_date: '',
        phone_number: '',
        email: '',
        position: ''
      });
      if (onEmployeeAdded) {
        onEmployeeAdded(response.data);
      }
    } catch (error) {
      setError(`Error adding employee: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}>
      <Typography variant="h6" gutterBottom>Add New Employee</Typography>
      <Box>
        <TextField
          name="name"
          label="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <TextField
          name="company"
          label="Company ID"
          value={formData.company}
          onChange={handleChange}
          required
        />
        <TextField
          name="department"
          label="Department"
          value={formData.department}
          onChange={handleChange}
          required
        />
      </Box>
      <Box>
        <TextField
          name="employee_id"
          label="Employee ID"
          value={formData.employee_id}
          onChange={handleChange}
          required
        />
        <TextField
          name="role"
          label="Role"
          value={formData.role}
          onChange={handleChange}
          required
        />
        <TextField
          name="start_date"
          label="Start Date"
          type="date"
          value={formData.start_date}
          onChange={handleChange}
          required
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          name="end_date"
          label="End Date"
          type="date"
          value={formData.end_date}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Box>
      <Box>
        <TextField
          name="phone_number"
          label="Phone Number"
          value={formData.phone_number}
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
        <TextField
          name="position"
          label="Position"
          value={formData.position}
          onChange={handleChange}
          required
        />
      </Box>
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>Add Employee</Button>
      <Snackbar open={!!error || !!success} autoHideDuration={6000} onClose={() => { setError(''); setSuccess(''); }}>
        <Alert onClose={() => { setError(''); setSuccess(''); }} severity={error ? "error" : "success"} variant="filled">
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddEmployee;
