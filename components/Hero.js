import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Hero.css';
import heroImage from '../assets/hero.webp';

const Hero = () => {
  const navigate = useNavigate();

  const handleBookService = () => {
    navigate('/register');
  };

  const handleViewPackages = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="home" style={{backgroundImage: `url(${heroImage})`}}>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <div className="hero-text">
          <h1>Premium Car Wash <span className="highlight">Experience</span></h1>
          <p>Transform your vehicle with our professional car wash services. Eco-friendly, fast, and affordable.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={handleBookService}>Wash My Car</button>
            <button className="btn-secondary" onClick={handleViewPackages}>View Packages</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;