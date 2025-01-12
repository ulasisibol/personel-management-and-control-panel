import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';

const DeletePersonnel = () => {
  const { user } = useAuth();
  const [personnelList, setPersonnelList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Number of items per page

  // Fetch personnel
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
  }, []);

  // Delete personnel
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
      fetchPersonnel(); // Refresh the list
    } catch (err) {
      console.error('Deletion error:', err);
      setError(err.response?.data?.message || 'An error occurred during deletion.');
    } finally {
      setLoading(false);
    }
  };

  // Search and filter personnel
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page
  };

  const filteredPersonnel = personnelList.filter((person) => {
    const fullName = `${person.first_name} ${person.last_name}`.toLowerCase();
    const department = person.department_name?.toLowerCase() || '';
    return (
      fullName.includes(searchQuery) ||
      department.includes(searchQuery) ||
      person.job_title.toLowerCase().includes(searchQuery)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPersonnel.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPersonnel.length / itemsPerPage);

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', backgroundColor: 'white' }}>
      <h4
     style={{
      marginBottom: "1.5rem",
      textAlign: "center",
      fontWeight: "bold",
    }}
    >Delete Personnel</h4>

        {/* Search Box */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search personnel..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div>
          {currentItems.map((person) => (
            <div
              key={person.personnel_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                marginBottom: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
              }}
            >
              {/* Name and Title */}
              <div>
                <h6 style={{ margin: 0 }}>
                  {person.first_name} {person.last_name}
                </h6>
                <small>{person.job_title}</small>
              </div>

              {/* Delete Button */}
              <button
                className="btn btn-sm btn-danger"
                style={{ alignSelf: 'center', backgroundColor: "#1a7f64", padding: "5px 10px 5px 10px", fontSize: "17px" }}
                onClick={() => handleDelete(person.personnel_id)}
              >
                Delete
              </button>
            </div>
          ))}

          {filteredPersonnel.length === 0 && (
            <div className="alert alert-info">No personnel found matching the search criteria.</div>
          )}
        </div>

        {/* Pagination */}
        {filteredPersonnel.length > itemsPerPage && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button
              className="btn btn-secondary btn-sm me-2"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              className="btn btn-secondary btn-sm ms-2"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeletePersonnel;
