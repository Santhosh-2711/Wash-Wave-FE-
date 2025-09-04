import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ErrorPage.css';
import errorImage from '../assets/500.jpg';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="error-page-container">
      <img 
        src={errorImage} 
        alt="Error 500" 
        className="error-image"
        onClick={() => navigate('/login')}
      />
    </div>
  );
};

export default ErrorPage;