import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    address: '',
    age: 0,
    role: '',
    securityQuestion: '',
    securityAnswer: ''
  });
  const [securityQuestions] = useState([
    "What is your favorite color?",
    "What was your first pet's name?",
    "What is your mother's maiden name?",
    "What city were you born in?",
    "What was the name of your elementary school?",
    "What is the name of your best friend?",
    "What is your favorite food?",
    "What was the make of your first car?",
    "What is your father's middle name?",
    "What is your favorite movie?"
  ]);
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.age || formData.age < 18 || formData.age > 100) {
      newErrors.age = 'Age must be between 18 and 100';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.securityQuestion) {
      newErrors.securityQuestion = 'Security question is required';
    }

    if (!formData.securityAnswer.trim()) {
      newErrors.securityAnswer = 'Security answer is required';
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
        "http://localhost:8088/auth/signup",
        {
          username: formData.username,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          address: formData.address,
          age: parseInt(formData.age),
          role: formData.role,
          securityQuestion: formData.securityQuestion,
          securityAnswer: formData.securityAnswer
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert('Registration successful! Welcome to Wash Wave!');
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data) {
        alert(
          "Registration failed: " +
          (typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data, null, 2))
        );
      } else {
        alert('Registration failed. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-background">
        <div className="register-card">
          <div className="register-header">
            <button className="back-btn" onClick={() => navigate('/')}>
              ← Back to Home
            </button>
            <h1>Join Wash Wave</h1>
            <p>Create your account for premium car wash services</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-row">
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
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter your email"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={errors.phoneNumber ? 'error' : ''}
                  placeholder="Enter 10-digit phone number"
                />
                {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
              </div>

              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className={errors.age ? 'error' : ''}
                  placeholder="Enter your age"
                  min="18"
                  max="100"
                />
                {errors.age && <span className="error-text">{errors.age}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? 'error' : ''}
                placeholder="Enter your complete address"
                rows="3"
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Create a password"
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Role</label>
              <div className="role-group">
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="CUSTOMER"
                    checked={formData.role === "CUSTOMER"}
                    onChange={handleChange}
                  />
                  <span className="radio-custom"></span>
                  Customer
                </label>
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="WASHER"
                    checked={formData.role === "WASHER"}
                    onChange={handleChange}
                  />
                  <span className="radio-custom"></span>
                  Washer
                </label>
              </div>
              {errors.role && <span className="error-text">{errors.role}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Security Question</label>
                <select
                  name="securityQuestion"
                  value={formData.securityQuestion}
                  onChange={handleChange}
                  className={errors.securityQuestion ? 'error' : ''}
                >
                  <option value="">Select a security question</option>
                  {securityQuestions.map((question, index) => (
                    <option key={index} value={question}>{question}</option>
                  ))}
                </select>
                {errors.securityQuestion && <span className="error-text">{errors.securityQuestion}</span>}
              </div>

              <div className="form-group">
                <label>Security Answer</label>
                <input
                  type="text"
                  name="securityAnswer"
                  value={formData.securityAnswer}
                  onChange={handleChange}
                  className={errors.securityAnswer ? 'error' : ''}
                  placeholder="Enter your answer"
                />
                {errors.securityAnswer && <span className="error-text">{errors.securityAnswer}</span>}
              </div>
            </div>

            <button 
              type="submit" 
              className="register-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner">⏳ Creating Account...</span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="register-footer">
            <p>Already have an account? <button onClick={() => navigate('/login')} className="link-btn">Sign In</button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;