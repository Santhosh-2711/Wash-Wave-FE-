import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';

// Helper function to decode JWT and extract payload
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Error parsing JWT:', err);
    return null;
  }
}

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(
        "http://localhost:8088/auth/authenticate",
        {
          username: formData.username,
          password: formData.password
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const token = response.data;
        console.log('Received token:', token);
        
        // Store token and username in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('username', formData.username);

        // Parse JWT to get user role
        const payload = parseJwt(token);
        console.log('JWT payload:', payload);
        const role = payload?.role;
        console.log('User role:', role);

        // Navigate based on role
        if (role === "ADMIN") {
          console.log('Navigating to admin dashboard');
          navigate("/admin-dashboard");
        } else if (role === "CUSTOMER") {
          console.log('Navigating to customer dashboard');
          navigate("/customer-dashboard");
        } else if (role === "WASHER") {
          console.log('Navigating to washer dashboard');
          navigate("/washer-dashboard");
        } else {
          console.log('Unknown role detected:', role);
          setErrors({ general: `Unknown role: ${role}. Please contact support.` });
        }

        // Clear form
        setFormData({ username: '', password: '' });
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      // Show simple error message
      
      if (error.response?.data) {
        const errorMessage = typeof error.response.data === "string" 
          ? error.response.data 
          : JSON.stringify(error.response.data, null, 2);
        setErrors({ general: errorMessage });
      } else {
        setErrors({ general: 'Login failed. Please check your connection.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-card">
          <div className="login-header">
            <button className="back-btn" onClick={() => navigate('/')}>
              ← Back to Home
            </button>
            <div className="welcome-section">
              <h1>Welcome Back!</h1>
              <p>Sign in to your Wash Wave account</p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : ''}
                placeholder="Enter your username"
              />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter your password"
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
              <button type="button" className="forgot-password" onClick={() => navigate('/forgot-password')}>
                Forgot Password?
              </button>
            </div>

            {errors.general && (
              <div className="error-text" style={{textAlign: 'center', marginBottom: '1rem'}}>
                {errors.general}
              </div>
            )}

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner">⏳ Signing In...</span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <button onClick={() => navigate('/register')} className="link-btn">Create Account</button></p>
          </div>
        </div>
      </div>
      

    </div>
  );
};

export default Login;