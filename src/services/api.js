import axios from 'axios';
import Cookies from 'js-cookie';

//const API_URL = 'http://localhost:8000/';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
});
export const getCsrfToken = async () => {
  const response = await api.get('/csrf/');
  return response.data.csrfToken;
};
api.interceptors.request.use(function (config) {
  const csrfToken = Cookies.get('csrftoken');
  if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
}, function (error) {
  return Promise.reject(error);
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};



// In services/api.js
export const login = (username, password) => api.post('login/', { username, password });
export const register = (userData) => 
  api.post('register/', userData)
    .then(response => {
      console.log('Registration API response:', response);
      return response;
    })
    .catch(error => {
      console.error('Registration API error:', error.response?.data || error.message);
      throw error;
    });
export const searchEmployees = (query) => api.get(`employees/search/?q=${query}`);

export const getCompanyDepartments = (id) => {
  return api.get(`/companies/${id}/departments`);
};
// In api.js
export const deleteRole = async (employeeId, roleId) => {
  return await axios.delete(`/api/employees/${employeeId}/roles/${roleId}/`);
};

export const addRole = async (employeeId, roleData) => {
  return await axios.post(`/api/employees/${employeeId}/roles/`, roleData);
};
export const getRoleHistory = (id) => api.get(`/employees/${id}/role-history/`);
export const getCompanies = () => api.get('companies/');
export const getCompany = (id) => {
  return api.get(`/companies/${id}`);
};

export const createCompany = (companyData) => api.post('companies/', companyData);

export const getEmployees = () => api.get('employees/');
export const getEmployee = (id) => api.get(`employees/${id}/`);
export const getEmployeeDetails = async (employeeId) => {
  try {
    const response = await api.get(`employees/${employeeId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const createEmployee = (employeeData) => api.post('/employees/', employeeData);

export const updateEmployee = (id, employeeData) => api.put(`/employees/${id}/`, employeeData);
export const deleteEmployee = (id) => api.delete(`/employees/${id}/`);

export const updateCompany = (id, companyData) => api.put(`/companies/${id}/`, companyData);
export const deleteCompany = (id) => api.delete(`/companies/${id}/`);


export const addDepartment = async (companyId, departmentData) => {
  console.log('Sending request to add department:', { companyId, departmentData });
  try {
    const response = await api.post(`/companies/${companyId}/departments/`, departmentData);
    console.log('Server response:', response);
    return response.data;
  } catch (error) {
    console.error('Server error response:', error.response?.data);
    throw error;
  }
};
export const deleteDepartment = (companyId, departmentId) => api.delete(`/companies/${companyId}/departments/${departmentId}/`);


export const bulkUpload = async (file, companyId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('company', companyId);

  try {
    const response = await api.post('employees/bulk_upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


export default api;