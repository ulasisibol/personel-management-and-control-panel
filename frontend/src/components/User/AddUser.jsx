import { useState } from 'react';
import axios from 'axios';

const AddUser = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    isSuperUser: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setFormData({ username: '', password: '', isSuperUser: false });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
      setSuccess('');
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
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Şifre</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <div className="mb-4">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="isSuperUser"
                checked={formData.isSuperUser}
                onChange={(e) => setFormData({...formData, isSuperUser: e.target.checked})}
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
      </div>
    </div>
  );
};

export default AddUser;