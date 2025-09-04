import React, { useState } from 'react';
import '../styles/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Booking request submitted! We\'ll contact you soon.');
    setFormData({ name: '', email: '', phone: '', service: '' });
  };

  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="contact-content">
          <div className="contact-info">
            <h2>Book Your Service</h2>
            <div className="info-item">
              <span className="icon">📍</span>
              <div>
                <h4>Location</h4>
                <p>Airoli, Navi Mumbai</p>
              </div>
            </div>
            <div className="info-item">
              <span className="icon">📞</span>
              <div>
                <h4>Phone</h4>
                <p>(+91)-1234567890</p>
              </div>
            </div>
            <div className="info-item">
              <span className="icon">📧</span>
              <div>
                <h4>Email</h4>
                <p>washwave@gmail.com</p>
              </div>
            </div>
            <div className="info-item">
              <span className="icon">⏰</span>
              <div>
                <h4>Hours</h4>
                <p>Mon-Sat: 8AM-6PM<br/>Sun: 9AM-5PM</p>
              </div>
            </div>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              required
            >
              <option value="">Select Service</option>
              <option value="basic">Basic Wash - $15</option>
              <option value="premium">Premium Wash - $25</option>
              <option value="deluxe">Deluxe Package - $40</option>
            </select>
            <button type="submit" className="submit-btn">Book Now</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;