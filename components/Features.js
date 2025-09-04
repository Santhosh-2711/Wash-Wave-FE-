import React from 'react';
import '../styles/Features.css';

const Features = () => {
  const features = [
    { icon: '🌱', title: 'Eco-Friendly', desc: 'Biodegradable products only' },
    { icon: '⚡', title: 'Quick Service', desc: '15-30 minutes average' },
    { icon: '💯', title: 'Quality Guarantee', desc: '100% satisfaction promise' },
    { icon: '📱', title: 'Easy Booking', desc: 'Book online or via app' }
  ];

  return (
    <section className="features">
      <div className="container">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;