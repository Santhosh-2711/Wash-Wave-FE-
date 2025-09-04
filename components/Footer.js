import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Wash Wave</h3>
            <p>Your trusted partner for professional car wash services.</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact Info</h4>
            <ul>
              <li>📞 (+91)-1234567890</li>
              <li>📧 washwave@gmail.com</li>
              <li>📍 Airoli,Navi Mumbai</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Newsletter</h4>
            <p>Subscribe for updates and special offers</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Your email" />
              <button type="submit" className="btn-secondary">Subscribe</button>
            </form>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Wash Wave. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;