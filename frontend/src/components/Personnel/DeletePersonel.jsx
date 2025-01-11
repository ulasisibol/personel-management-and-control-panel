// src/components/Personnel/DeletePersonnel.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';

const DeletePersonnel = () => {
  const { user } = useAuth();
  const [personnelList, setPersonnelList] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // 1) Fetch personnel (admin => all, normal => own department)
  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/personnel', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPersonnelList(response.data);
      setError('');
    } catch (err) {
      setError('An error occurred while fetching the personnel list.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Delete personnel
  const handleDelete = async (personnelId) => {
    if (!window.confirm('Are you sure you want to delete this personnel?')) {
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/personnel/delete/${personnelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Personnel deleted successfully.');
      setError('');

      // Refresh list after deletion
      fetchPersonnel();
    } catch (err) {
      console.error('Deletion error:', err);
      setError(err.response?.data?.message || 'An error occurred during deletion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Delete Personnel</h3>

      {loading && <div>Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* List personnel */}
      <div className="mt-3">
        {personnelList.map((person) => (
          <div key={person.personnel_id} className="border p-2 mb-2">
            <strong>{person.first_name} {person.last_name}</strong> - {person.department_name || 'No Department'}
            <button
              className="btn btn-sm btn-danger ms-3"
              onClick={() => handleDelete(person.personnel_id)}
            >
              Delete
            </button>
          </div>
        ))}
        {personnelList.length === 0 && (
          <div className="alert alert-info">No personnel found.</div>
        )}
      </div>
    </div>
  );
};

export default DeletePersonnel;
