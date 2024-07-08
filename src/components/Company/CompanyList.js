import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  List, ListItem, ListItemText, Typography, Container, CircularProgress, 
  Paper, Divider, ListItemIcon, Box, Grid, TextField, Button, IconButton, 
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MuiAlert from '@mui/material/Alert';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getCompanies, deleteCompany } from '../../services/api';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function CompanyList() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await getCompanies();
      console.log("Fetched companies:", response.data);
      setCompanies(response.data);
      setFilteredCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to load companies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleAddCompany = () => {
    navigate('/add-company');
  };

  const handleEditCompany = (companyId) => {
    navigate(`/edit-company/${companyId}`);
  };

  const handleDeleteCompany = async (companyId) => {
    try {
      await deleteCompany(companyId);
      setSuccess('Company deleted successfully');
      fetchCompanies();
    } catch (error) {
      setError(`Error deleting company: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleSearchInputChange = (event) => {
    const newQuery = event.target.value;
    console.log("Search input changed:", newQuery);
    setSearchQuery(newQuery);
    handleSearch(newQuery);
  };

  const handleSearch = (query) => {
    const lowercaseQuery = query.toLowerCase().trim();
    console.log("Search query:", lowercaseQuery);
    
    const filtered = companies.filter(company => {
      console.log("Checking company:", company.name);
      console.log("Company departments:", company.departments);
      
      const nameMatch = company.name.toLowerCase().includes(lowercaseQuery);
      let departmentMatch = false;
      
      if (company.departments) {
        if (Array.isArray(company.departments)) {
          departmentMatch = company.departments.some(dept => 
            dept.toLowerCase().includes(lowercaseQuery)
          );
        } else if (typeof company.departments === 'string') {
          departmentMatch = company.departments.toLowerCase().split(',').some(dept => 
            dept.trim().includes(lowercaseQuery)
          );
        } else if (typeof company.departments === 'object') {
          // If departments is an object, search through its values
          departmentMatch = Object.values(company.departments).some(dept =>
            dept.name.toLowerCase().includes(lowercaseQuery)
          );
        }
      }
      
      console.log("Name match:", nameMatch);
      console.log("Department match:", departmentMatch);
      
      return nameMatch || departmentMatch;
    });
    
    console.log("Filtered companies:", filtered);
    setFilteredCompanies(filtered);
  };

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" gutterBottom align="center">
          Companies
        </Typography>

        <StyledPaper elevation={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={7}>
              <TextField
                variant="outlined"
                fullWidth
                label="Search company by name or department"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') {
                    handleSearch(searchQuery);
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button variant="contained" color="primary" onClick={() => handleSearch(searchQuery)} fullWidth>
                Search
              </Button>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Button variant="outlined" color="secondary" onClick={fetchCompanies} fullWidth startIcon={<RefreshIcon />}>
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
            onClick={handleAddCompany}
          >
            Add Company
          </Button>
        </Box>

        <Paper elevation={3}>
          <List>
            {filteredCompanies.map((company, index) => (
              <React.Fragment key={company.id}>
                <ListItem
                  divider={index < filteredCompanies.length - 1}
                >
                  <ListItemIcon>
                    <BusinessIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Link to={`/companies/${company.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {company.name}
                      </Link>
                    } 
                    secondary={`Employees: ${company.employee_count || 'N/A'} | Departments: ${
                      Array.isArray(company.departments) 
                        ? company.departments.join(', ')
                        : typeof company.departments === 'string'
                          ? company.departments
                          : typeof company.departments === 'object'
                            ? Object.values(company.departments).map(dept => dept.name).join(', ')
                            : 'N/A'
                    }`}
                  />
                  <Box>
                    <IconButton 
                      edge="end" 
                      aria-label="edit" 
                      onClick={() => handleEditCompany(company.id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      onClick={() => handleDeleteCompany(company.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>

        {filteredCompanies.length === 0 && (
          <Typography variant="body1" align="center">No companies found.</Typography>
        )}
      </Box>

      <Snackbar open={!!error || !!success} autoHideDuration={6000} onClose={() => { setError(''); setSuccess(''); }}>
        <Alert onClose={() => { setError(''); setSuccess(''); }} severity={error ? "error" : "success"}>
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default CompanyList;