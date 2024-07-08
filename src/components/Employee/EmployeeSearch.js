import React, { useState } from 'react';
import { TextField, Button, Grid, Paper, Typography } from '@mui/material';
import { searchEmployees } from '../services/api';

const EmployeeSearch = () => {
  const [searchParams, setSearchParams] = useState({
    name: '',
    employer: '',
    position: '',
    department: '',
    yearStarted: '',
    yearLeft: '',
  });

  const [searchResults, setSearchResults] = useState([]);

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const results = await searchEmployees(searchParams);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching employees:', error);
    }
  };

  return (
    <Paper style={{ padding: '20px', margin: '20px' }}>
      <Typography variant="h5" gutterBottom>
        Employee Search
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="name"
              label="Name"
              value={searchParams.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="employer"
              label="Employer"
              value={searchParams.employer}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="position"
              label="Position"
              value={searchParams.position}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="department"
              label="Department"
              value={searchParams.department}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="yearStarted"
              label="Year Started"
              value={searchParams.yearStarted}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="yearLeft"
              label="Year Left"
              value={searchParams.yearLeft}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Search
            </Button>
          </Grid>
        </Grid>
      </form>
      {searchResults.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <Typography variant="h6" gutterBottom>
            Search Results
          </Typography>
          {/* Display search results here */}
        </div>
      )}
    </Paper>
  );
};

export default EmployeeSearch;