import React, { useState, useEffect, useCallback } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import { getCompany,getCsrfToken, getCompanyDepartments } from '../../services/api';
import { Typography, Container, CircularProgress, Paper, List, ListItem, ListItemText, Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';
import AddDepartment from './AddDepartment';
import DeleteDepartment from './DeleteDepartment';



  function CompanyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
  
    const fetchData = useCallback(async () => {
      try {
        // Fetch CSRF token first
        await getCsrfToken();
  
        const [companyResponse, departmentsResponse] = await Promise.all([
          getCompany(id),
          getCompanyDepartments(id)
        ]);
        setCompany(companyResponse.data);
        setDepartments(departmentsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response && error.response.status === 401) {
          // Unauthorized, redirect to login
          navigate('/login');
        } else {
          setError(`Failed to fetch company data: ${error.response?.data?.detail || error.message}`);
        }
      } finally {
        setLoading(false);
      }
    }, [id, navigate]);
  
    useEffect(() => {
      console.log('Fetching data for company id:', id);
      fetchData();
    }, [fetchData, id]);

  useEffect(() => {
    console.log('Fetching data for company id:', id);
    fetchData();
  }, [fetchData, id]);

  const handleDepartmentAdded = (newDepartment) => {
    setDepartments(prevDepartments => [...prevDepartments, newDepartment]);
    setSuccess('Department added successfully');
  };

  const handleDepartmentDeleted = (deletedDepartmentId) => {
    setDepartments(prevDepartments => prevDepartments.filter(dept => dept.id !== deletedDepartmentId));
    setSuccess('Department deleted successfully');
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!company) {
    return <Typography>Company not found</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {company.name}
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Typography><strong>Registration Date:</strong> {company.registration_date}</Typography>
        <Typography><strong>Registration Number:</strong> {company.registration_number}</Typography>
        <Typography><strong>Address:</strong> {company.address}</Typography>
        <Typography><strong>Contact Person:</strong> {company.contact_person}</Typography>
        <Typography><strong>Contact Phone:</strong> {company.contact_phone}</Typography>
        <Typography><strong>Email:</strong> {company.email}</Typography>
      </Paper>
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Typography variant="h6" gutterBottom>Departments</Typography>
        {departments.length > 0 ? (
          <List>
            {departments.map((department) => (
              <ListItem key={department.id}
                secondaryAction={
                  <DeleteDepartment
                    companyId={id}
                    departmentId={department.id}
                    onDepartmentDeleted={() => handleDepartmentDeleted(department.id)}
                  />
                }
              >
                <ListItemText primary={department.name} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No departments found.</Typography>
        )}
        <AddDepartment
          companyId={id}
          onDepartmentAdded={handleDepartmentAdded}
        />
      </Paper>
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" variant="filled">
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}


export default CompanyDetail