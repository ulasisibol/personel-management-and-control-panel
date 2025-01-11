import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth.js';

const UpdateUser = () => {
    const { user } = useAuth();
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Load users
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/auth/users', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(response.data);
        } catch (err) {
            setError('An error occurred while loading users.');
        }
    };

    // Load departments
    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/departments/list', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDepartments(response.data);
        } catch (err) {
            setError('An error occurred while loading departments.');
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    // Automatically fill the form when a user is selected
    const handleUserSelect = (selectedUserId) => {
        setUserId(selectedUserId);
        const selectedUser = users.find((user) => user.id === parseInt(selectedUserId));
        if (selectedUser) {
            setUsername(selectedUser.username);
            setDepartmentId(selectedUser.department ? selectedUser.department.id : '');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:3000/api/auth/users/update/${userId}`,
                { username, password, departmentId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setSuccess('User updated successfully.');
            setError('');
            setPassword('');
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
            setSuccess('');
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h4 className="card-title">Update User</h4>
                <form onSubmit={handleUpdate}>
                    <div className="mb-3">
                        <label className="form-label">Select User</label>
                        <select
                            className="form-select"
                            value={userId}
                            onChange={(e) => handleUserSelect(e.target.value)}
                            required
                        >
                            <option value="">Select User</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.username}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Select Department</label>
                        <select
                            className="form-select"
                            value={departmentId}
                            onChange={(e) => setDepartmentId(e.target.value)}
                            required
                        >
                            <option value="">Select Department</option>
                            {departments.map((department) => (
                                <option key={department.departman_id} value={department.departman_id}>
                                    {department.departman_adi}
                                </option>
                            ))}
                        </select>
                    </div>
                    {success && <div className="alert alert-success">{success}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}
                    <button type="submit" className="btn btn-primary">
                        Update
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateUser;
