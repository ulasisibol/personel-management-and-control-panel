import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth.js';

const AddUser = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    isSuperUser: true, // Varsayılan olarak admin yetkisi açık
    departmentId: '' // Departman ID'si için state
  });
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Admin kontrolü
  if (!user?.isSuperUser) {
    return <Navigate to="/dashboard" replace />;
  }

  // Departmanları yükle
  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/departments/list');
      setDepartments(response.data);
    } catch (err) {
      setError('Departmanları yüklerken bir hata oluştu.');
    }
  };

  // Kullanıcıları yükle
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
      setError('Kullanıcıları yüklerken bir hata oluştu.');
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, []);

  // Admin yetkisini departman seçimine bağlı kontrol et
  useEffect(() => {
    if (formData.departmentId) {
      setFormData((prevFormData) => ({ ...prevFormData, isSuperUser: false }));
    } else {
      setFormData((prevFormData) => ({ ...prevFormData, isSuperUser: true }));
    }
  }, [formData.departmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/auth/register',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSuccess('Kullanıcı başarıyla oluşturuldu');
      setFormData({ username: '', password: '', isSuperUser: true, departmentId: '' });
      setError('');
      fetchUsers(); // Kullanıcıları güncelle
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
      setSuccess('');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/auth/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSuccess('Kullanıcı başarıyla silindi');
        fetchUsers(); // Kullanıcıları güncelle
      } catch (err) {
        setError(err.response?.data?.message || 'Bir hata oluştu');
        setSuccess('');
      }
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Yeni Kullanıcı Ekle</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Kullanıcı Adı</label>
            <input
              type="text"
              className="form-control"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Şifre</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Departman Seç</label>
            <select
              className="form-select"
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              required
            >
              <option value="">Departman Seçin</option>
              {departments.map(department => (
                <option key={department.departman_id} value={department.departman_id}>
                  {department.departman_adi}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="isSuperUser"
                checked={formData.isSuperUser}
                disabled={!!formData.departmentId} // Departman seçilmişse admin yetkisi devre dışı
              />
              <label className="form-check-label" htmlFor="isSuperUser">
                Admin Yetkisi
              </label>
            </div>
          </div>
          {error && <div className="alert alert-danger mb-3">{error}</div>}
          {success && <div className="alert alert-success mb-3">{success}</div>}
          <button type="submit" className="btn btn-primary">
            Kullanıcı Oluştur
          </button>
        </form>

        <h4 className="card-title mt-4">Mevcut Kullanıcılar</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Kullanıcı Adı</th>
              <th>Departman</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.department}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.username=="admin"} // Admin kullanıcılar için sil butonu devre dışı
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddUser;
