import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      // staff and student have different home page
      navigate(response.data.role === 'staff' ? '/staff' : '/checkin');
    } catch (error) {
      setError('Login failed. Wrong email or password.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="qut-panel">
        <h1 className="qut-title">Login</h1>
        {location.state?.message && <p className="qut-msg-ok">{location.state.message}</p>}
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="qut-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="qut-input"
        />
        {error && <p className="qut-msg-error">{error}</p>}
        <button type="submit" className="qut-btn w-full">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
