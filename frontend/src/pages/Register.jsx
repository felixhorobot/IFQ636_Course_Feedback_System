import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/auth/register', formData);
      // login page show this message
      navigate('/login', { state: { message: 'Registration successful. Please log in.' } });
    } catch (error) {
      setError(error.response?.data?.message === 'User already exists'
        ? 'Registration failed. This email is already used.'
        : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="qut-panel">
        <h1 className="qut-title">Register</h1>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="qut-input"
        />
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
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
