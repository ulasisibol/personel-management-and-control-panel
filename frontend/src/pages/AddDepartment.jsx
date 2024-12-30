import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth.js';
import { Navigate } from 'react-router-dom';

const AddDepartment = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ departmanAdi: '' });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Admin kontrolü
  if (!user?.isSuperUser) {
    return <Navigate to="/dashboard" replace />;
  }

  // Departmanları listele
  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/departments/list');
      setDepartments(response.data);
    } catch (err) {
      setError('Departmanları yüklerken bir hata oluştu.');
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/departments/create',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSuccess('Departman başarıyla oluşturuldu');
      setFormData({ departmanAdi: '' });
      setError('');
      fetchDepartments(); // Departmanları güncelle
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
      setSuccess('');
    }
  };

  const handleDelete = async (departmentId) => {
    if (window.confirm('Bu departmanı silmek istediğinize emin misiniz?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/departments/delete/${departmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSuccess('Departman başarıyla silindi');
        fetchDepartments(); // Departmanları güncelle
      } catch (err) {
        setError(err.response?.data?.message || 'Bir hata oluştu');
        setSuccess('');
      }
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Yeni Departman Ekle</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Departman Adı</label>
            <input
              type="text"
              className="form-control"
              value={formData.departmanAdi}
              onChange={(e) => setFormData({ ...formData, departmanAdi: e.target.value })}
              required
            />
          </div>
          {error && <div className="alert alert-danger mb-3">{error}</div>}
          {success && <div className="alert alert-success mb-3">{success}</div>}
          <button type="submit" className="btn btn-primary">
            Departman Oluştur
          </button>
        </form>

        <h4 className="card-title mt-4">Mevcut Departmanlar</h4>
        <table className="table">
  <thead>
    <tr>
      <th>Departman Adı</th>
      <th>Yöneticiler</th>
      <th>İşlemler</th>
    </tr>
  </thead>
  <tbody>
    {departments.map((dept) => (
      <tr key={dept.departman_id}>
        <td>{dept.departman_adi}</td>
        <td>
          {dept.managers.length > 0
            ? dept.managers.map(manager => manager.username).join(', ') // Yöneticileri virgülle ayırarak yazdır
            : 'Yönetici Yok'}
        </td>
        <td>
          <button
            className="btn btn-danger"
            onClick={() => handleDelete(dept.departman_id)}
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

export default AddDepartment;
