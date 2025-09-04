import React, { useEffect, useRef, useState } from 'react';
import '../styles/Testimonials.css';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef();

  const testimonials = [
    {
      name: 'John Smith',
      avatar: '👨‍💼',
      rating: 5,
      review: 'Best car wash experience ever! Booking was easy and the service was top-notch.'
    },
    {
      name: 'Sarah Johnson',
      avatar: '👩‍💻',
      rating: 5,
      review: 'Affordable and reliable. The washer was polite and thorough.'
    },
    {
      name: 'Mike Davis',
      avatar: '👨‍🔧',
      rating: 5,
      review: 'No more waiting at service centers—this app is a game changer!'
    },
    {
      name: 'Priya Mehra',
      avatar: '👩‍🎓',
      rating: 5,
      review: 'Loved the doorstep service! My car looks spotless and the process was super smooth.'
    },
    
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    intervalRef.current = setInterval(nextTestimonial, 3000);
    return () => clearInterval(intervalRef.current);
  }, [currentIndex]);

  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <h2>What Our Customers Say</h2>
        <div className="testimonial-carousel">
          <div className="testimonial-card">
            <div className="testimonial-header">
              <div className="avatar">{testimonials[currentIndex].avatar}</div>
              <div className="testimonial-info">
                <h4>{testimonials[currentIndex].name}</h4>
                <div className="rating">
                  {'★'.repeat(testimonials[currentIndex].rating)}
                </div>
              </div>
            </div>
            <p className="testimonial-text">{testimonials[currentIndex].review}</p>
          </div>
          
          <div className="carousel-controls">
            <button onClick={prevTestimonial} className="carousel-btn">‹</button>
            <button onClick={nextTestimonial} className="carousel-btn">›</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;