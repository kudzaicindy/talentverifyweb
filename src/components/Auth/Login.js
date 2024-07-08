import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Container, Snackbar, Box, CircularProgress } from '@mui/material';
import Alert from '@mui/material/Alert';
import { useNavigate, Link } from 'react-router-dom';
import { login, setAuthToken, getCsrfToken } from '../../services/api';

function Login( {setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setAuthToken(token);
    }

    getCsrfToken()
      .then(() => {
        console.log('CSRF token fetched successfully');
      })
      .catch(error => {
        console.error('Error fetching CSRF token:', error);
        setError('Failed to fetch CSRF token. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(username, password);
      const { token } = response.data;
      localStorage.setItem('token', token);
      setAuthToken(token);
      setIsAuthenticated(true);
      navigate('/companies');  // Redirect to employees page after successful login
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'An unexpected error occurred. Please try again.');
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isLoggedIn) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <Button variant="contained" component={Link} to="/employees">
            Employees
          </Button>
          <Button variant="contained" component={Link} to="/companies">
            Companies
          </Button>
          <Button variant="contained" component={Link} to="/bulk-upload">
            Bulk Upload
          </Button>
          <Button variant="contained" color="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button fullWidth variant="contained" color="primary" type="submit">
          Login
        </Button>
      </form>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Login;