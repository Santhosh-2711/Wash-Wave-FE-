import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: username, 2: security question, 3: reset password
  const [formData, setFormData] = useState({
    username: '',
    securityAnswer: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      setErrors({ username: 'Username is required' });
      return;
    }

    setLoading(true);
    try {
      console.log('Making request to:', `http://localhost:8088/auth/fp/${formData.username}`);
      const response = await axios.get(`http://localhost:8088/auth/fp/${formData.username}`);
      console.log('Response received:', response);
      console.log('Response data:', response.data);
      setSecurityQuestion(response.data);
      setStep(2);
      setErrors({});
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      
      let errorMessage = 'User not found or no security question set';
      if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ username: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!formData.securityAnswer.trim()) {
      setErrors({ securityAnswer: 'Security answer is required' });
      return;
    }

    setLoading(true);
    try {
      console.log('Making request to:', `http://localhost:8088/auth/fp/verify-answer`);
      console.log('Request params:', { username: formData.username, answer: formData.securityAnswer });
      await axios.post('http://localhost:8088/auth/fp/verify-answer', null, {
        params: {
          username: formData.username,
          answer: formData.securityAnswer
        }
      });
      setStep(3);
      setErrors({});
    } catch (error) {
      console.error('Security answer error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error headers:', error.response?.headers);
      let errorMessage = 'Incorrect security answer';
      if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
      }
      setErrors({ securityAnswer: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 4) {
      newErrors.newPassword = 'Password must be at least 4 characters';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:8088/auth/fp/reset-password', {
        username: formData.username,
        newPassword: formData.newPassword
      });
      alert('Password reset successfully!');
      navigate('/login');
    } catch (error) {
      setErrors({ general: 'Failed to reset password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-background">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <button className="back-btn" onClick={() => navigate('/login')}>
              ← Back to Login
            </button>
            <h1>Reset Password</h1>
            <p>Follow the steps to reset your password</p>
          </div>

          {step === 1 && (
            <form className="forgot-password-form" onSubmit={handleUsernameSubmit}>
              <div className="step-indicator">
                <span className="step active">1</span>
                <span className="step">2</span>
                <span className="step">3</span>
              </div>
              <h3>Step 1: Enter Username</h3>
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
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form className="forgot-password-form" onSubmit={handleSecurityAnswerSubmit}>
              <div className="step-indicator">
                <span className="step completed">✓</span>
                <span className="step active">2</span>
                <span className="step">3</span>
              </div>
              <h3>Step 2: Answer Security Question</h3>
              <div className="security-question">
                <p><strong>Question:</strong> {securityQuestion}</p>
              </div>
              <div className="form-group">
                <label>Your Answer</label>
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
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Answer'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form className="forgot-password-form" onSubmit={handlePasswordReset}>
              <div className="step-indicator">
                <span className="step completed">✓</span>
                <span className="step completed">✓</span>
                <span className="step active">3</span>
              </div>
              <h3>Step 3: Set New Password</h3>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={errors.newPassword ? 'error' : ''}
                  placeholder="Enter new password"
                />
                {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm new password"
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
              {errors.general && <div className="error-text">{errors.general}</div>}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;