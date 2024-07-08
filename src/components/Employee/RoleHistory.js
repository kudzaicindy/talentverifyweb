import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getRoleHistory, deleteRole, addRole } from '../../services/api';
import { 
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, CircularProgress, IconButton, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

function RoleHistory() {
  const { id } = useParams();
  const [roleHistory, setRoleHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newRole, setNewRole] = useState({ title: '', start_date: '', end_date: '', duties: '' });

  const fetchRoleHistory = useCallback(async () => {
    if (!id) {
      setError('Employee ID is not available');
      setLoading(false);
      return;
    }

    try {
      const response = await getRoleHistory(id);
      setRoleHistory(response.data);
    } catch (error) {
      console.error('Error fetching role history:', error);
      setError('Failed to fetch role history');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRoleHistory();
  }, [fetchRoleHistory]);

  const handleDeleteRole = async (roleId) => {
    try {
      await deleteRole(id, roleId);
      setRoleHistory(roleHistory.filter(role => role.id !== roleId));
    } catch (error) {
      console.error('Error deleting role:', error);
      setError('Failed to delete role');
    }
  };

  const handleAddRole = async () => {
    try {
      const response = await addRole(id, newRole);
      setRoleHistory([...roleHistory, response.data]);
      setOpenAddDialog(false);
      setNewRole({ title: '', start_date: '', end_date: '', duties: '' });
    } catch (error) {
      console.error('Error adding role:', error);
      setError('Failed to add role');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Paper>
      <Typography variant="h6" component="h2" gutterBottom>
        Role History
      </Typography>
      <Button
        startIcon={<AddIcon />}
        onClick={() => setOpenAddDialog(true)}
        variant="contained"
        color="primary"
        style={{ marginBottom: '1rem' }}
      >
        Add New Role
      </Button>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Duties</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roleHistory.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.title}</TableCell>
                <TableCell>{role.start_date}</TableCell>
                <TableCell>{role.end_date || 'Present'}</TableCell>
                <TableCell>{role.duties}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDeleteRole(role.id)} color="secondary">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Role</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newRole.title}
            onChange={(e) => setNewRole({ ...newRole, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newRole.start_date}
            onChange={(e) => setNewRole({ ...newRole, start_date: e.target.value })}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newRole.end_date}
            onChange={(e) => setNewRole({ ...newRole, end_date: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Duties"
            fullWidth
            multiline
            rows={4}
            value={newRole.duties}
            onChange={(e) => setNewRole({ ...newRole, duties: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddRole} color="primary">Add</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default RoleHistory;