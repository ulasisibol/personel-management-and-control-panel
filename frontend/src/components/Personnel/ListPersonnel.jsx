import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth.js';

const ListPersonnel = () => {
  const { user } = useAuth();
  const [personnelList, setPersonnelList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Number of items per page

  // Fetch personnel data
  const fetchPersonnel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/personnel', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPersonnelList(response.data);
    } catch (err) {
      console.error('An error occurred while fetching the personnel list:', err.message);
      setError('An error occurred while fetching the personnel list.');
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  // Search function
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  // Toggle details on click
  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Filtering personnel
  const filteredPersonnel = personnelList.filter((person) => {
    const fullName = `${person.first_name} ${person.last_name}`.toLowerCase();
    const department = person.department_name?.toLowerCase() || '';
    return (
      fullName.includes(searchQuery) ||
      department.includes(searchQuery) ||
      person.job_title.toLowerCase().includes(searchQuery)
    );
  });

  // Get current page items
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
    >All Personnel</h4>

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

        <div>
          {currentItems.map((person) => (
            <div
              key={person.personnel_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                marginBottom: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: expandedId === person.personnel_id ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'box-shadow 0.3s ease',
              }}
              onClick={() => toggleExpand(person.personnel_id)}
            >
              {/* Profile Picture */}
              <div>
                {person.base64Image ? (
                  <img
                    src={`data:image/jpeg;base64,${person.base64Image}`}
                    alt="profile"
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: '#1a7f64',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}
                  >
                    {person.first_name[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name and Title */}
              <div>
                <h6 style={{ margin: 0 }}>
                  {person.first_name} {person.last_name}
                </h6>
                <small>{person.job_title}</small>
              </div>

              {expandedId === person.personnel_id && (
                <div style={{ marginTop: '1rem', width: '100%' }}>
                  <div
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '1rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                      <div>
                        <p><strong>First Name:</strong> {person.first_name}</p>
                        <p><strong>Email:</strong> {person.email}</p>
                      </div>
                      <div>
                        <p><strong>Last Name:</strong> {person.last_name}</p>
                        <p><strong>Phone:</strong> {person.phone}</p>
                      </div>
                      <div>
                        <p><strong>Department:</strong> {person.department_name || 'Not Specified'}</p>
                        <p><strong>Address:</strong> {person.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredPersonnel.length === 0 && (
            <div className="alert alert-info">
              No personnel found matching the search criteria.
            </div>
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
            <span style={{ alignSelf: 'center' }}>Page {currentPage} of {totalPages}</span>
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

export default ListPersonnel;
