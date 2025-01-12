import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../../context/useAuth.js';
import logo from "../../assets/logo-1.png"

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        username,
        password
      });

      console.log('Login response:', response.data);

      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        login(response.data.user, response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center" style={{backgroundColor: "black", borderRadius: "5px 10px 10px 10px"}}> 
      <div className="card shadow-sm" style={{ width: '400px', backgroundColor: "rgb(32 33 35)", color: "white"}}>
        <div className="card-body p-5" >
          <h2 className="text-center mb-4"><img style={{ width: '100px' }} src={logo} alt="" /></h2>
          <form onSubmit={handleLogin} >
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
            <div className="mb-4">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="alert alert-danger py-2 mb-4">{error}</div>
            )}
            <button type="submit" className="btn btn-primary w-100" style={{backgroundColor: "#1a7f64"}}>
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
