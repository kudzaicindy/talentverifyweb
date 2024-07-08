import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployee, getCsrfToken } from '../../services/api';
import { Typography, Container, CircularProgress, Paper, List, ListItem, ListItemText } from '@mui/material';
import RoleHistory from './RoleHistory';

function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch CSRF token first
      await getCsrfToken();

      const response = await getEmployee(id);
      setEmployee(response.data);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      if (error.response && error.response.status === 401) {
        // Unauthorized, redirect to login
        navigate('/login');
      } else {
        setError(`Failed to fetch employee data: ${error.response?.data?.detail || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    console.log('Fetching data for employee id:', id);
    fetchData();
  }, [fetchData, id]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!employee) {
    return <Typography>Employee not found</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {employee.name}
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Typography><strong>Employee ID:</strong> {employee.employee_id}</Typography>
        <Typography><strong>Department:</strong> {employee.department}</Typography>
        <Typography><strong>Role:</strong> {employee.role}</Typography>
        <Typography><strong>Date Started:</strong> {employee.start_date}</Typography>
        <Typography><strong>Date Left:</strong> {employee.end_date}</Typography>
        <Typography><strong>Phone Number:</strong> {employee.phone_number}</Typography>
        <Typography><strong>Email:</strong> {employee.email}</Typography>
        <Typography><strong>Position:</strong> {employee.position}</Typography>
      </Paper>
      <Typography variant="h5" style={{ marginTop: '20px' }}>Role History</Typography>
      <List>
        {employee.roles && employee.roles.map((role, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={role.title}
              secondary={`${role.start_date} - ${role.end_date || 'Present'}`}
            />
          </ListItem>
        ))}
      </List>
      <RoleHistory employeeId={id} />
    </Container>
  );
}

export default EmployeeDetail;