import React, { useState, useEffect, useCallback } from 'react';
import { getEmployees, searchEmployees, deleteEmployee } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Container, 
  TextField, 
  Button, 
  CircularProgress, 
  Box,
  Paper,
  Grid,
  Snackbar,
  IconButton
} from '@mui/material';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StyledList = styled(List)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.background.paper,
}));

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getEmployees();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to fetch employees. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchEmployees();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await searchEmployees(searchQuery);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error searching employees:', error);
      setError('Failed to search employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddEmployee = () => {
    navigate('/add-employee');
  };

  const handleEditEmployee = (employeeId) => {
    navigate(`/edit-employee/${employeeId}`);
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await deleteEmployee(employeeId);
      setSuccess('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      setError(`Error deleting employee: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>Employees</Typography>
      
      <StyledPaper elevation={3}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={7}>
            <TextField
              variant="outlined"
              fullWidth
              label="Search employees"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button variant="contained" color="primary" onClick={handleSearch} fullWidth>
              Search
            </Button>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Button variant="outlined" color="secondary" onClick={fetchEmployees} fullWidth startIcon={<RefreshIcon />}>
              Refresh
            </Button>
          </Grid>
        </Grid>
      </StyledPaper>

      <Box mt={2} mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddEmployee}
        >
          Add Employee
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : employees.length > 0 ? (
        <StyledList>
          {employees.map((employee) => (
            <ListItem
              key={employee.id}
              divider
              secondaryAction={
                <Box>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEditEmployee(employee.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteEmployee(employee.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText 
                primary={
                  <Link to={`/employees/${employee.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {employee.name}
                  </Link>
                }
                secondary={`${employee.department} - ${employee.role}`} 
              />
            </ListItem>
          ))}
        </StyledList>
      ) : (
        <Typography variant="body1" align="center">No employees found.</Typography>
      )}

      <Snackbar open={!!error || !!success} autoHideDuration={6000} onClose={() => { setError(''); setSuccess(''); }}>
        <Alert onClose={() => { setError(''); setSuccess(''); }} severity={error ? "error" : "success"} variant="filled">
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default EmployeeList;