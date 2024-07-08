import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Typography, Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchDepartments, deleteDepartment } from './api';
import AddDepartment from './AddDepartment';

const DepartmentList = ({ companyId }) => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await fetchDepartments(companyId);
        setDepartments(data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    loadDepartments();
  }, [companyId]);

  const handleDeleteDepartment = async (departmentId) => {
    try {
      await deleteDepartment(companyId, departmentId);
      setDepartments(departments.filter(dept => dept.id !== departmentId));
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  const handleDepartmentAdded = (newDepartment) => {
    setDepartments([...departments, newDepartment]);
  };

  return (
    <Box>
      <Typography variant="h5">Departments</Typography>
      {departments.length > 0 ? (
        <List>
          {departments.map((department) => (
            <ListItem
              key={department.id}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteDepartment(department.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={department.name} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>No departments found.</Typography>
      )}

      <AddDepartment companyId={companyId} onDepartmentAdded={handleDepartmentAdded} />
    </Box>
  );
};

export default DepartmentList;