import React, { useState } from 'react';
import '../styles/ServiceAreas.css';
import mumbaiMap from '../assets/mumbai-map.jpg';

const ServiceAreas = () => {
  const [selectedArea, setSelectedArea] = useState(null);
  
  const serviceAreas = [
    { name: 'Vashi', position: { top: '70%', left: '85%' }, description: 'Complete car wash services in Vashi area' },
    { name: 'Airoli', position: { top: '20%', left: '85%' }, description: 'Premium car care in Airoli' },
    { name: 'Dadar', position: { top: '85%', left: '35%' }, description: 'Professional car wash in Dadar' },
    { name: 'Goregaon', position: { top: '15%', left: '40%' }, description: 'Quality car wash in Goregaon' },
    { name: 'Andheri West', position: { top: '25%', left: '30%' }, description: 'Expert car care in Andheri West' },
    { name: 'Andheri', position: { top: '50%', left: '40%' }, description: 'Premium services in Andheri' }
  ];

  return (
    <section className="service-areas" id="service-areas">
      <div className="container">
        <h2>Our Service Areas</h2>
        <p className="section-subtitle">We provide premium car wash services across Mumbai and surrounding areas</p>
        
        <div className="map-container">
          <div className="map-visual" style={{backgroundImage: `url(${mumbaiMap})`}}>
            <h3>Mumbai & Surrounding Areas</h3>
            {serviceAreas.map((area, index) => (
              <div
                key={index}
                className={`area-marker ${selectedArea === index ? 'active' : ''}`}
                style={area.position}
                onClick={() => setSelectedArea(selectedArea === index ? null : index)}
              >
                <div className="marker">🚗</div>
                <span className="area-name">{area.name}</span>
              </div>
            ))}
            {selectedArea !== null && (
              <div className="area-details">
                <button 
                  className="close-btn" 
                  onClick={() => setSelectedArea(null)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#ff0000',
                    color: '#ffffff',
                    border: 'none',
                    width: '25px',
                    height: '25px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                  }}
                >
                  ×
                </button>
                <h4>{serviceAreas[selectedArea].name}</h4>
                <p>{serviceAreas[selectedArea].description}</p>
                <button className="book-btn">Book Now</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceAreas;