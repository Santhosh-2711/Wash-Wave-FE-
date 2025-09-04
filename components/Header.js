import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Smooth scroll handler
  const handleScroll = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="Wash Wave Logo" style={{ height: '56px', width: '56px' }} />
          <span className="logo-text" style={{ fontWeight: 'bold', fontSize: '2rem', color: '#01579b', letterSpacing: '2px' }}>
            WASH WAVE
          </span>
        </div>
        
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <ul>
            <li>
              <button className="nav-btn" onClick={() => handleScroll('home')}>Home</button>
            </li>
            <li>
              <button className="nav-btn" onClick={() => handleScroll('services')}>Services</button>
            </li>
            
            
            <li>
              <button className="nav-btn" onClick={() => handleScroll('service-areas')}>Areas</button>
            </li>
            <li>
              <button className="nav-btn" onClick={() => handleScroll('footer')}>Contact</button>
            </li>
          </ul>
        </nav>

        <div className="header-cta">
          <button className="btn-primary" onClick={() => navigate('/register')}>Book Now</button>
        </div>

        <div 
          className="hamburger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </header>
  );
};

export default Header;