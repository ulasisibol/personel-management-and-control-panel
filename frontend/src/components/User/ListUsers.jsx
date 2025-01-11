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
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">All Users</h4>

        {/* Search Box */}
        <div className="mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Username</th>
                <th>Admin</th>
                <th>Associated Personnel</th>
                <th>Department</th>
                <th>Employee Count</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="row-spacing">
                  <td>{user.username}</td>
                  <td>{user.isSuperUser ? 'Yes' : 'No'}</td>
                  <td>
                    {user.personnel
                      ? `${user.personnel.firstName} ${user.personnel.lastName}`
                      : 'No Association'}
                  </td>
                  <td>{user.department?.name || 'Not specified'}</td>
                  <td>{user.department?.employeeCount || 0}</td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">
                    No users found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListUsers;
