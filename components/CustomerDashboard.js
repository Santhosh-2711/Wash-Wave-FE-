import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CustomerDashboard.css';
import Car_Wash_Service from  '../assets/car-wash-hero.jpg'; 

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState({ username: '', email: '', phoneNumber: '', address: '', age: '', password: '', profilePhoto: '' });
  const [orders, setOrders] = useState([]);
  const [paidBookings, setPaidBookings] = useState(new Set());
  const [orderFilter, setOrderFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [allOrders, setAllOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedService, setSelectedService] = useState('PREMIUM_WASH');
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '10:00:00',
    carDetails: '',
    specialInstructions: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    const username = localStorage.getItem('username');
    setUser(prev => ({ ...prev, username }));
    
    // Clear paid bookings on fresh load to avoid stale data
    setPaidBookings(new Set());
    localStorage.removeItem('paidBookings');
    
    // Load profile photo from localStorage
    const savedPhoto = localStorage.getItem('profilePhoto');
    if (savedPhoto) {
      setUser(prev => ({ ...prev, profilePhoto: savedPhoto }));
    }
    
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        setOrders([]);
        return;
      }
      
      const response = await fetch('http://localhost:8088/bookings/customer/getAll', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const bookings = await response.json();
        
        const formattedOrders = bookings.map(booking => ({
          id: booking.id,
          service: booking.serviceType?.replace('_', ' '),
          serviceType: booking.serviceType,
          date: booking.bookingDate,
          time: booking.bookingTime,
          status: booking.status,
          price: booking.price,
          rating: booking.rating || 0,
          location: booking.location,
          carDetails: booking.carDetails,
          washerName: booking.washerName,
          washerPhone: booking.washerPhone
        }));
        
        setAllOrders(formattedOrders);
        setOrders(formattedOrders);
        setPendingOrders(formattedOrders.filter(order => order.status === 'PENDING'));
        setAcceptedOrders(formattedOrders.filter(order => order.status === 'ACCEPTED'));
        setCompletedOrders(formattedOrders.filter(order => order.status === 'COMPLETED'));
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        setAllOrders([]);
        setOrders([]);
        setPendingOrders([]);
        setAcceptedOrders([]);
        setCompletedOrders([]);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setAllOrders([]);
      setOrders([]);
      setPendingOrders([]);
      setAcceptedOrders([]);
      setCompletedOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleServiceSelect = (serviceType) => {
    setSelectedService(serviceType);
  };

  const handleBookService = async () => {
    if (!bookingForm.date || !bookingForm.carDetails) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Creating booking order...');
      console.log('Token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        alert('Please login again');
        navigate('/login');
        return;
      }
      
      // Create booking without payment
      console.log('Sending request with token:', token.substring(0, 20) + '...');
      
      const bookingResponse = await fetch('http://localhost:8088/bookings/customer/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: 'Mumbai',
          bookingDate: bookingForm.date,
          bookingTime: bookingForm.time,
          serviceType: selectedService,
          carDetails: bookingForm.carDetails,
          specialInstructions: bookingForm.specialInstructions || ''
        })
      });
      
      console.log('Booking response status:', bookingResponse.status);
      
      if (!bookingResponse.ok) {
        const errorText = await bookingResponse.text();
        console.error('Booking creation failed:', errorText);
        alert('Failed to create booking. Please try again.');
        return;
      }
      
      const booking = await bookingResponse.json();
      console.log('Booking created:', booking);
      
      alert('Order created successfully! Go to "My Orders" to make payment.');
      fetchUserBookings();
      setActiveTab('orders');
      
      // Reset form
      setBookingForm({
        date: '',
        time: '10:00:00',
        carDetails: '',
        specialInstructions: ''
      });
      
    } catch (error) {
      console.error('Booking error:', error);
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        alert('CORS Error: Please check backend server configuration. The booking may have been created in the database.');
      } else {
        alert('Failed to create booking. Please try again.');
      }
    }
  };

  const handlePayment = async (bookingId, amount) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Starting payment for booking:', bookingId);
      
      // Create payment order
      const paymentResponse = await fetch('http://localhost:8088/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: bookingId
        })
      });
      
      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error('Payment order creation failed:', errorText);
        alert('Failed to create payment order. Please try again.');
        return;
      }
      
      const paymentOrder = await paymentResponse.json();
      console.log('Payment order created:', paymentOrder);
      
      // Open Razorpay payment
      const options = {
        key: 'rzp_test_y1vzLqvL8KzlOo', // Replace with your actual Razorpay key
        amount: paymentOrder.amount * 100, // Amount from payment service in paise
        currency: paymentOrder.currency,
        name: 'WashWave',
        description: 'Car Wash Service Payment',
        order_id: paymentOrder.orderId,
        handler: async function (response) {
          try {
            console.log('Payment successful, verifying...', response);
            
            const verifyResponse = await fetch('http://localhost:8088/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                bookingId: bookingId
              })
            });
            
            // Mark booking as paid and save to localStorage
            setPaidBookings(prev => {
              const newPaidBookings = new Set([...prev, bookingId]);
              localStorage.setItem('paidBookings', JSON.stringify([...newPaidBookings]));
              return newPaidBookings;
            });
            alert('💳 Payment Successful! Admin will verify and update the booking status.');
            fetchUserBookings();
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('❌ Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.username,
          email: user.email || 'customer@washwave.com',
          contact: user.phoneNumber || '9999999999'
        },
        theme: {
          color: '#2a5298'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled by user');
          }
        }
      };
      
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert('❌ Payment gateway not loaded. Please refresh the page and try again.');
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ Failed to process payment. Please try again.');
    }
  };

  const handleSubmitReview = async (bookingId, rating, comment) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8089/bookings/customer/review/${bookingId}?rating=${rating}&comment=${encodeURIComponent(comment)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      alert('Review submitted successfully!');
      fetchUserBookings();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUser(prev => ({ ...prev, profilePhoto: e.target.result }));
        localStorage.setItem('profilePhoto', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setUser(prev => ({ ...prev, profilePhoto: '' }));
    localStorage.removeItem('profilePhoto');
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login again');
        navigate('/login');
        return;
      }

      // Extract userId from JWT token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.Id; // Based on your JWT structure

      const profileData = {
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        age: parseInt(user.age) || 0
      };

      console.log('Updating profile for userId:', userId, 'with data:', profileData);

      const response = await axios.put(`http://localhost:8088/auth/customers/${userId}`, profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Profile update response:', response.data);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/login');
      } else {
        const errorMessage = error.response?.data || error.message;
        alert(errorMessage);
      }
    }
  };

  const renderDashboard = () => (
    <div className="dashboard-overview">
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user.username || 'Customer'}!</h1>
            <p>Your service dashboard • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div className="performance-badge">
              <span className="rating">⭐ Premium Customer</span>
              <span className="completion">{orders.length} total bookings</span>
            </div>
          </div>
          <div className="hero-image">
            <img src={Car_Wash_Service} alt="Car Wash Service" />
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-header">
            <h3>Total Bookings</h3>
            <span className="trend up">+{orders.length > 0 ? '100' : '0'}%</span>
          </div>
          <div className="metric-value">{orders.length}</div>
          <div className="metric-subtitle">All time bookings</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <h3>Active Orders</h3>
            <div className="live-indicator"></div>
          </div>
          <div className="metric-value">{orders.filter(order => order.status === 'PENDING' || order.status === 'ACCEPTED').length}</div>
          <div className="metric-subtitle">{orders.filter(order => order.status === 'PENDING').length} pending • {orders.filter(order => order.status === 'ACCEPTED').length} in progress</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <h3>Completed Orders</h3>
            <img src="/assets/analytics-chart.svg" alt="Analytics" className="metric-icon" />
          </div>
          <div className="metric-value">{orders.filter(order => order.status === 'COMPLETED').length}</div>
          <div className="metric-subtitle">Successfully completed</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <h3>Total Spent</h3>
            {/* <span className="trend up">+12%</span> */}
          </div>
          <div className="metric-value">₹{orders.reduce((sum, order) => sum + order.price, 0)}</div>
          <div className="metric-subtitle">All time spending</div>
        </div>
      </div>

      <div className="dashboard-actions">
        <div className="action-grid">
          <button className="action-card" onClick={() => setActiveTab('booking')}>
            <div className="action-icon orders"></div>
            <h4>Book New Service</h4>
            <p>Schedule your next car wash</p>
          </button>
          <button className="action-card" onClick={() => setActiveTab('orders')}>
            <div className="action-icon analytics"></div>
            <h4>My Orders</h4>
            <p>Track your service history</p>
          </button>
          {/* <button className="action-card" onClick={() => setActiveTab('calendar')}>
            <div className="action-icon calendar"></div>
            <h4>Calendar View</h4>
            <p>View your scheduled services</p>
          </button> */}
          <button className="action-card" onClick={() => setActiveTab('profile')}>
            <div className="action-icon notifications"></div>
            <h4>Profile Settings</h4>
            <p>Manage your account details</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderBooking = () => (
    <div className="booking-content">
      <h2>🚗 Book a Car Wash Service</h2>
      <div className="booking-form">
        <div className="service-selection">
          <h3>🔧 Select Service</h3>
          <div className="service-cards">
            <div className={`service-card ${selectedService === 'BASIC_WASH' ? 'selected' : ''}`}>
              <div className="service-icon">🧽</div>
              <h4>Basic Wash</h4>
              <p>Exterior wash & dry</p>
              <span className="price">₹500</span>
              <button className="select-btn" onClick={() => handleServiceSelect('BASIC_WASH')}>
                {selectedService === 'BASIC_WASH' ? '✓ Selected' : 'Select'}
              </button>
            </div>
            <div className={`service-card ${selectedService === 'PREMIUM_WASH' ? 'selected' : ''}`}>
              <div className="service-icon">✨</div>
              <h4>Premium Wash</h4>
              <p>Exterior + Interior cleaning</p>
              <span className="price">₹750</span>
              <button className="select-btn" onClick={() => handleServiceSelect('PREMIUM_WASH')}>
                {selectedService === 'PREMIUM_WASH' ? '✓ Selected' : 'Select'}
              </button>
            </div>
            <div className={`service-card ${selectedService === 'DELUXE_PACKAGE' ? 'selected' : ''}`}>
              <div className="service-icon">💎</div>
              <h4>Deluxe Package</h4>
              <p>Complete car detailing</p>
              <span className="price">₹1000</span>
              <button className="select-btn" onClick={() => handleServiceSelect('DELUXE_PACKAGE')}>
                {selectedService === 'DELUXE_PACKAGE' ? '✓ Selected' : 'Select'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="booking-details">
          <div className="form-group">
            <label>📅 Select Date</label>
            <input 
              type="date" 
              min={new Date().toISOString().split('T')[0]}
              value={bookingForm.date}
              onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>⏰ Select Time</label>
            <select 
              value={bookingForm.time}
              onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
            >
              <option value="09:00:00">9:00 AM</option>
              <option value="10:00:00">10:00 AM</option>
              <option value="11:00:00">11:00 AM</option>
              <option value="14:00:00">2:00 PM</option>
              <option value="15:00:00">3:00 PM</option>
              <option value="16:00:00">4:00 PM</option>
            </select>
          </div>
          <div className="form-group">
            <label>🚙 Car Details</label>
            <input 
              type="text" 
              placeholder="Car make and model"
              value={bookingForm.carDetails}
              onChange={(e) => setBookingForm({...bookingForm, carDetails: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>📝 Special Instructions</label>
            <textarea 
              placeholder="Any special requirements..."
              value={bookingForm.specialInstructions}
              onChange={(e) => setBookingForm({...bookingForm, specialInstructions: e.target.value})}
            ></textarea>
          </div>
          <div className="booking-actions">
            <button className="book-btn" onClick={handleBookService}>🎯 Book Service</button>
          </div>
        </div>
      </div>
    </div>
  );

  const getFilteredOrders = () => {
    switch (orderFilter) {
      case 'pending': return pendingOrders;
      case 'accepted': return acceptedOrders;
      case 'completed': return completedOrders;
      default: return allOrders;
    }
  };

  const getCurrentPageOrders = () => {
    const filtered = getFilteredOrders();
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    return filtered.slice(indexOfFirstOrder, indexOfLastOrder);
  };

  const totalPages = Math.ceil(getFilteredOrders().length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (filter) => {
    setOrderFilter(filter);
    setCurrentPage(1);
  };

  const renderOrders = () => (
    <div className="orders-content">
      <div className="orders-header">
        <h2>My Orders</h2>
        <div className="order-filters">
          <button 
            className={`filter-btn ${orderFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All Orders ({allOrders.length})
          </button>
          <button 
            className={`filter-btn ${orderFilter === 'pending' ? 'active' : ''}`}
            onClick={() => handleFilterChange('pending')}
          >
            Pending ({pendingOrders.length})
          </button>
          <button 
            className={`filter-btn ${orderFilter === 'accepted' ? 'active' : ''}`}
            onClick={() => handleFilterChange('accepted')}
          >
            In Progress ({acceptedOrders.length})
          </button>
          <button 
            className={`filter-btn ${orderFilter === 'completed' ? 'active' : ''}`}
            onClick={() => handleFilterChange('completed')}
          >
            Completed ({completedOrders.length})
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : (
        <>
          <div className="orders-list">
            {getCurrentPageOrders().length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"></div>
                <h4>No {orderFilter === 'all' ? '' : orderFilter} orders found</h4>
                <p>Orders will appear here when available</p>
                {orderFilter === 'all' && (
                  <button className="book-now-btn" onClick={() => setActiveTab('booking')}>
                    Book Your First Service
                  </button>
                )}
              </div>
            ) : (
              getCurrentPageOrders().map(order => (
                <div key={order.id} className={`order-card modern ${order.status?.toLowerCase()}`}>
                  <div className="order-header">
                    <div className="order-id">#{order.id}</div>
                    <span className={`status-badge ${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-content">
                    <div className="order-main-info">
                      <h4>{order.service || order.serviceType?.replace('_', ' ')}</h4>
                      {order.washerName && (
                        <div className="washer-info">
                          <span className="washer-name">Washer: {order.washerName}</span>
                          {order.washerPhone && (
                            <span className="washer-phone">{order.washerPhone}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="order-details">
                      <div className="detail-row">
                        <span className="detail-label">Date & Time:</span>
                        <span className="detail-value">{order.date} at {order.time}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">{order.location || 'Mumbai'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Vehicle:</span>
                        <span className="detail-value">{order.carDetails || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Amount:</span>
                        <span className="detail-value amount">₹{order.price}</span>
                      </div>
                    </div>
                    {order.status === 'PENDING' && (
                      <div className="order-actions">
                        <button className="pay-btn" onClick={() => handlePayment(order.id, order.price)}>
                          Pay Now
                        </button>
                      </div>
                    )}
                    {order.status === 'COMPLETED' && order.rating === 0 && (
                      <div className="order-actions">
                        <button className="review-btn" onClick={() => handleSubmitReview(order.id, 5, 'Great service!')}>
                          Rate Service
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              
              <button 
                className="pagination-btn" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  // const renderCalendar = () => {
  //   const today = new Date();
  //   const currentMonth = today.getMonth();
  //   const currentYear = today.getFullYear();
  //   const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  //   const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
  //   const days = [];
  //   for (let i = 0; i < firstDay; i++) {
  //     days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  //   }
    
  //   for (let day = 1; day <= daysInMonth; day++) {
  //     const hasBooking = orders.some(order => {
  //       const orderDate = new Date(order.date);
  //       return orderDate.getDate() === day && orderDate.getMonth() === currentMonth;
  //     });
      
  //     days.push(
  //       <div key={day} className={`calendar-day ${hasBooking ? 'has-booking' : ''} ${day === today.getDate() ? 'today' : ''}`}>
  //         <span className="day-number">{day}</span>
  //         {hasBooking && <div className="booking-indicator"></div>}
  //       </div>
  //     );
  //   }

  //   return (
  //     <div className="calendar-content">
  //       <div className="calendar-header">
  //         <h2>Calendar View</h2>
  //         <div className="calendar-controls">
  //           <button className="calendar-nav">‹</button>
  //           <h3>{today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
  //           <button className="calendar-nav">›</button>
  //         </div>
  //       </div>
  //       <div className="calendar-modern">
  //         <div className="calendar-weekdays">
  //           {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
  //             <div key={day} className="weekday">{day}</div>
  //           ))}
  //         </div>
  //         <div className="calendar-days">
  //           {days}
  //         </div>
  //       </div>
  //       <div className="calendar-summary">
  //         <div className="summary-item">
  //           <div className="summary-dot scheduled"></div>
  //           <span>Scheduled Services</span>
  //         </div>
  //         <div className="summary-item">
  //           <div className="summary-dot today"></div>
  //           <span>Today</span>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };

  const renderProfile = () => (
    <div className="profile-content">
      <div className="profile-header">
        <h2>Profile Settings</h2>
        <p>Manage your account information</p>
      </div>
      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="profile-avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoUpload}
              style={{display: 'none'}} 
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="btn-upload">Upload Photo</label>
            {user.profilePhoto && (
              <button className="btn-remove" onClick={handleRemovePhoto}>Remove</button>
            )}
          </div>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{orders.filter(order => order.status === 'COMPLETED').length}</span>
              <span className="stat-label">Completed Orders</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">₹{orders.reduce((sum, order) => sum + order.price, 0)}</span>
              <span className="stat-label">Total Spent</span>
            </div>
          </div>
        </div>
        <div className="profile-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={user.username} readOnly />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={user.email} 
                  onChange={(e) => setUser({...user, email: e.target.value})} 
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  value={user.phoneNumber} 
                  onChange={(e) => setUser({...user, phoneNumber: e.target.value})}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input 
                  type="number" 
                  value={user.age} 
                  onChange={(e) => setUser({...user, age: e.target.value})}
                  placeholder="Enter your age"
                  min="1"
                  max="120"
                />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Address</label>
              <textarea 
                value={user.address} 
                onChange={(e) => setUser({...user, address: e.target.value})}
                placeholder="Enter your complete address"
                rows="3"
              ></textarea>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-save" onClick={handleSaveProfile}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="customer-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <h3>WashWave</h3>
            <span className="logo-subtitle">Customer</span>
          </div>
          <div className="user-info">
            <div className="user-avatar">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">{user.username.charAt(0).toUpperCase()}</div>
              )}
            </div>
            <div className="user-details">
              <span className="user-name">{user.username || 'Customer'}</span>
              <span className="user-status online">Online</span>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon dashboard"></span>
            Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'booking' ? 'active' : ''}`}
            onClick={() => setActiveTab('booking')}
          >
            <span className="nav-icon orders"></span>
            Book Service
          </button>
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <span className="nav-icon analytics"></span>
            My Orders
          </button>
          {/* <button 
            className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <span className="nav-icon calendar"></span>
            Calendar
          </button> */}
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-icon profile"></span>
            Profile
          </button>
          <button className="nav-item logout" onClick={handleLogout}>
            <span className="nav-icon logout"></span>
            Logout
          </button>
        </nav>
      </div>
      
      <div className="dashboard-main">
        <div className="main-header">
          <div className="header-left">
            <h1 className="page-title">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'booking' && 'Book New Service'}
              {activeTab === 'orders' && 'My Orders'}
              {/* {activeTab === 'calendar' && 'Calendar View'} */}
              {activeTab === 'profile' && 'Profile Settings'}
            </h1>
          </div>
          <div className="header-right">
            <div className="real-time-indicator">
              <div className="status-dot active"></div>
              <span>Real-time updates</span>
            </div>
          </div>
        </div>
        <div className="dashboard-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'booking' && renderBooking()}
          {activeTab === 'orders' && renderOrders()}
          {/* {activeTab === 'calendar' && renderCalendar()} */}
          {activeTab === 'profile' && renderProfile()}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;