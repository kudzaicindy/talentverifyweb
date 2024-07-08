import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Component imports
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CompanyList from './components/Company/CompanyList';
import CompanyDetail from './components/Company/CompanyDetail';
import EmployeeList from './components/Employee/EmployeeList';
import EmployeeDetail from './components/Employee/EmployeeDetail';
import BulkUpload from './components/BulkUpload/BulkUpload';
import AddEmployee from './components/Employee/AddEmployee';
import DeleteEmployee from './components/Employee/DeleteEmployee';
import UpdateEmployee from './components/Employee/UpdateEmployee';
import UpdateCompany from './components/Company/UpdateCompany';
import AddCompany from './components/Company/AddCompany';
import DeleteCompany from './components/Company/DeleteCompany';
import Home from './Home';

// API import
import api from './services/api';

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `url('/bench-accounting-nvzvOPQW0gc-unsplash.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        },
      },
    },
  },
});

const ProtectedRoute = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Token ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" style={{ flexGrow: 1 }}>
                Talent Verify
              </Typography>
              {!isAuthenticated ? (
                <>
                  <Button color="inherit" component={Link} to="/">
                    Login
                  </Button>
                  <Button color="inherit" component={Link} to="/register">
                    Register
                  </Button>
                </>
              ) : (
                <>
                  <Button color="inherit" component={Link} to="/companies">
                    Companies
                  </Button>
                  <Button color="inherit" component={Link} to="/employees">
                    Employees
                  </Button>
                  <Button color="inherit" component={Link} to="/bulk-upload">
                    Bulk Upload
                  </Button>
                  <Button color="inherit" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              )}
            </Toolbar>
          </AppBar>
          <Routes>
            <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/companies" element={<CompanyList />} />
              <Route path="/companies/:id" element={<CompanyDetail />} />
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/employees/:id" element={<EmployeeDetail />} />
              <Route path="/bulk-upload" element={<BulkUpload />} />
              <Route path="/add-employee" element={<AddEmployee />} />
              <Route path="/add-company" element={<AddCompany />} />
              <Route path="/edit-employee/:id" element={<UpdateEmployee />} />
              <Route path="/delete-employee/:id" element={<DeleteEmployee />} />
              <Route path="/edit-company/:id" element={<UpdateCompany />} />
              <Route path="/delete-company/:id" element={<DeleteCompany />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;