import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth.js';

const ListUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/auth/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
      setFilteredUsers(response.data); // Initially show all users
    } catch (err) {
      setError('An error occurred while fetching the user list.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search functionality
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = users.filter((user) => {
      const fullName = `${user.personnel?.firstName || ''} ${user.personnel?.lastName || ''}`.toLowerCase();
      const department = user.department?.name?.toLowerCase() || '';
      return (
        user.username.toLowerCase().includes(query) ||
        fullName.includes(query) ||
        department.includes(query)
      );
    });

    setFilteredUsers(filtered);
  };

  return (
    <div className="card user-list-card">
      <div className="card-body">
      <h4
     style={{
      marginBottom: "1.5rem",
      textAlign: "center",
      fontWeight: "bold",
    }}
    >List User</h4>
        {/* Search Box */}
        <div className="mb-4">
          <input
            type="text"
            className="form-control search-box"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-container">
          <div className="table-header">
            <div>Username</div>
            <div>Admin</div>
            <div>Associated Personnel</div>
            <div>Department</div>
            <div>Employee Count</div>
          </div>
          <div className="table-rows">
            {filteredUsers.map((user) => (
              <div key={user.id} className="table-row">
                <div>{user.username}</div>
                <div>{user.isSuperUser ? 'Yes' : 'No'}</div>
                <div>
                  {user.personnel
                    ? `${user.personnel.firstName} ${user.personnel.lastName}`
                    : 'No Association'}
                </div>
                <div>{user.department?.name || 'Not specified'}</div>
                <div>{user.department?.employeeCount || 0}</div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="no-users">No users found matching search criteria.</div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .user-list-card {
          color: black;
          border-radius: 10px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          margin: 20px;
          padding: 20px;
        }
        .card-title {
          color: #ffffff;
          font-weight: bold;
          text-align: center;
        }
        .search-box {
          padding: 10px;
          border: 1px solid #444;
          border-radius: 8px;
          color: #ffffff;
          transition: box-shadow 0.3s ease;
        }
        .table-container {
          margin-top: 20px;
        }
        .table-header {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          background: #1a7f64;
          color: #ffffff;
          padding: 10px;
          border-radius: 6px;
          font-weight: bold;
          text-align: center;
        }
        .table-rows {
          margin-top: 10px;
        }
        .table-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          text-align: center;
          background: #ffffff;
          color: #2c2f33;
          border-radius: 6px;
          padding: 10px;
          margin-bottom: 10px;
          box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
        }
        .table-row:hover {
          background: #e8e8e8;
        }
        .no-users {
          text-align: center;
          padding: 20px;
          color: #dcdcdc;
        }
      `}</style>
    </div>
  );
};

export default ListUsers;
