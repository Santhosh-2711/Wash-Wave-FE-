import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Services.css';

const Services = () => {
  const navigate = useNavigate();

  const handleSelectPackage = () => {
    navigate('/register');
  };

  const services = [
    {
      icon: '🧽',
      title: 'Basic Wash',
      price: '₹500',
      features: ['Exterior wash', 'Tire cleaning', 'Basic interior vacuum']
    },
    {
      icon: '✨',
      title: 'Premium Wash',
      price: '₹750',
      features: ['Everything in Basic', 'Interior detailing', 'Wax protection', 'Dashboard polish']
    },
    {
      icon: '💎',
      title: 'Deluxe Package',
      price: '₹1000',
      features: ['Everything in Premium', 'Engine cleaning', 'Leather treatment', 'Paint protection']
    }
  ];

  return (
    <section className="services" id="services">
      <div className="container">
        <h2>Our Services</h2>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <div className="price">{service.price}</div>
              <ul>
                {service.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>
              <button className="select-btn" onClick={handleSelectPackage}>Select Package</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;