import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import api from '../services/api';
import '../App.css';

function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useBooking();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      
      // Store token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Update context - CRITICAL: Update both user and isAuthenticated
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      // Set token in API headers for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      setMessage('Login successful! Redirecting...');
      
      // Redirect based on role
      setTimeout(() => {
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/book');
        }
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>🏸 Login to Badminton Booking</h1>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {message && (
            <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-error'}`}>
              {message}
            </div>
          )}
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
          <p>Continue as <Link to="/book">Guest</Link></p>
        </div>

        <div className="demo-credentials">
          <h3>Demo Accounts:</h3>
          <div className="credentials-grid">
            <div className="credential-card">
              <strong>Admin</strong>
              <p>Email: admin@badminton.com</p>
              <p>Password: admin123</p>
            </div>
            <div className="credential-card">
              <strong>User</strong>
              <p>Email: john@example.com</p>
              <p>Password: user123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
