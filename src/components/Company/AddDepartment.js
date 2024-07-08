import React, { useState } from 'react';
import { addDepartment } from '../../services/api';

const AddDepartment = ({ companyId }) => {
  const [departmentName, setDepartmentName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const response = await addDepartment(companyId, { name: departmentName });
      console.log('Department added successfully:', response);
      setSuccess(true);
      setDepartmentName('');
    } catch (error) {
      console.error('Error adding department:', error.response?.data || error.message);
      setError(error.response?.data?.company || error.response?.data || 'An error occurred while adding the department');
    }
  };

  return (
    <div>
      <h2>Add New Department</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
          placeholder="Enter department name"
          required
        />
        <button type="submit">Add Department</button>
      </form>
      {error && <p style={{ color: 'red' }}>{typeof error === 'object' ? JSON.stringify(error) : error}</p>}
      {success && <p style={{ color: 'green' }}>Department added successfully!</p>}
    </div>
  );
};

export default AddDepartment;