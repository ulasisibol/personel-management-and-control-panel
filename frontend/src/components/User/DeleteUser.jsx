import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth.js';

const DeleteUser = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/auth/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (err) {
      setError('An error occurred while loading users.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/auth/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSuccess('User successfully deleted');
        fetchUsers(); // Update users
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
        setSuccess('');
      }
    }
  };

  return (
    <div className="card" style={{margin: "20px", borderRadius: "10px"}}>
      <div className="card-body">
      <h4
     style={{
      marginBottom: "1.5rem",
      textAlign: "center",
      fontWeight: "bold",
    }}
    >Delete User</h4>
        {error && <div className="alert alert-danger mb-3">{error}</div>}
        {success && <div className="alert alert-success mb-3">{success}</div>}
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((usr) => (
              <tr key={usr.id}>
                <td>{usr.username}</td>
                <td>{usr.department ? usr.department.name : 'No Department'}</td> {/* Show department name */}
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteUser(usr.id)}
                    disabled={usr.username === 'admin'} // Disable delete button for admin users
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        
        .btn-danger{
          background-color: #1a7f64;
          border: none;
          color: #fff;
          padding: 5px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 5px;
          width: 80%;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .btn-danger:hover {
          background-color: #10a37f;
        }
        
      `}</style>
    </div>
  );
};

export default DeleteUser;
