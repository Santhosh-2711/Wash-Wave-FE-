import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/WasherDashboard.css';
import Professional_Service from '../assets/car-wash-hero.jpg'; 

const WasherDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState({ username: '', email: '', phoneNumber: '', address: '', age: '', password: '', profilePhoto: '' });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [earnings, setEarnings] = useState({ today: 1250, week: 8750, month: 32500 });
  const [performance, setPerformance] = useState({ rating: 4.8, completionRate: 95 });
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [orderFilter, setOrderFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'WASHER') {
      navigate('/login');
      return;
    }
    
    const username = localStorage.getItem('username');
    setUser(prev => ({ ...prev, username }));
    
    const savedPhoto = localStorage.getItem('profilePhoto');
    if (savedPhoto) {
      setUser(prev => ({ ...prev, profilePhoto: savedPhoto }));
    }
    
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const pendingResponse = await axios.get('http://localhost:8088/bookings/washer/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPendingOrders(pendingResponse.data);

      const acceptedResponse = await axios.get('http://localhost:8088/bookings/washer/accepted', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAcceptedOrders(acceptedResponse.data);

      const completedResponse = await axios.get('http://localhost:8088/bookings/washer/completed', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCompletedOrders(completedResponse.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8088/bookings/washer/accept/${orderId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      alert('Order accepted successfully!');
      fetchOrders();
    } catch (error) {
      console.error('Failed to accept order:', error);
      alert('Failed to accept order. Please try again.');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8088/bookings/washer/complete/${orderId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      alert('Order marked as completed!');
      fetchOrders();
    } catch (error) {
      console.error('Failed to complete order:', error);
      alert('Failed to complete order. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
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

      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.Id;

      const profileData = {
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        age: parseInt(user.age) || 0
      };

      await axios.put(`http://localhost:8088/auth/washers/${userId}`, profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

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
            <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user.username || 'Professional'}!</h1>
            <p>Your service dashboard • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div className="performance-badge">
              <span className="rating">⭐ {performance.rating}</span>
              <span className="completion">{performance.completionRate}% completion rate</span>
            </div>
          </div>
          <div className="hero-image">
            <img src={Professional_Service} alt="Professional Service" />
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-header">
            <h3>Today's Earnings</h3>
            <span className="trend up">+12%</span>
          </div>
          <div className="metric-value">₹{earnings.today}</div>
          <div className="metric-subtitle">vs yesterday</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <h3>Active Orders</h3>
            <div className="live-indicator"></div>
          </div>
          <div className="metric-value">{pendingOrders.length + acceptedOrders.length}</div>
          <div className="metric-subtitle">{pendingOrders.length} pending • {acceptedOrders.length} in progress</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <h3>Completed Today</h3>
            <img src="/assets/analytics-chart.svg" alt="Analytics" className="metric-icon" />
          </div>
          <div className="metric-value">{completedOrders.filter(order => new Date(order.bookingDate).toDateString() === new Date().toDateString()).length}</div>
          <div className="metric-subtitle">Total: {completedOrders.length} orders</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <h3>Weekly Revenue</h3>
            <span className="trend up">+8%</span>
          </div>
          <div className="metric-value">₹{earnings.week}</div>
          <div className="metric-subtitle">This week</div>
        </div>
      </div>

      <div className="dashboard-actions">
        <div className="action-grid">
          <button className="action-card" onClick={() => setActiveTab('orders')}>
            <div className="action-icon orders"></div>
            <h4>Manage Orders</h4>
            <p>View and process customer requests</p>
          </button>
          <button className="action-card" onClick={() => setActiveTab('profile')}>
            <div className="action-icon profile"></div>
            <h4>Profile Settings</h4>
            <p>Manage your account details</p>
          </button>
        </div>
      </div>
    </div>
  );

  const getFilteredOrders = () => {
    const allOrders = [...pendingOrders, ...acceptedOrders, ...completedOrders];
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
        <h2>Order Management</h2>
        <div className="order-filters">
          <button 
            className={`filter-btn ${orderFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All Orders ({getFilteredOrders().length})
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
      
      <div className="orders-list">
        {getCurrentPageOrders().length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h4>No {orderFilter === 'all' ? '' : orderFilter} orders found</h4>
            <p>Orders will appear here when available</p>
          </div>
        ) : (
          getCurrentPageOrders().map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">#{order.id}</div>
                <span className={`status-badge ${order.status?.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-content">
                <div className="order-main-info">
                  <h4>{order.serviceType?.replace('_', ' ')}</h4>
                  <div className="customer-info">
                    <span className="customer-name">Customer: {order.customerName || 'N/A'}</span>
                    {order.customerPhone && (
                      <span className="customer-phone">{order.customerPhone}</span>
                    )}
                  </div>
                </div>
                <div className="order-details">
                  <div className="detail-row">
                    <span className="detail-label">Date & Time:</span>
                    <span className="detail-value">{order.bookingDate} at {order.bookingTime}</span>
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
                {order.status?.toLowerCase() === 'PENDING' && (
                  <div className="order-actions">
                    <button className="btn-accept" onClick={() => handleAcceptOrder(order.id)}>
                      Accept Order
                    </button>
                  </div>
                )}
                {order.status === 'ACCEPTED' && (
                  <div className="order-actions">
                    <button className="btn-complete" onClick={() => handleCompleteOrder(order.id)}>
                      Mark Complete
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
    </div>
  );

  const renderProfile = () => (
    <div className="profile-content">
      <div className="profile-header">
        <h2>Profile Settings</h2>
        <p>Manage your professional information</p>
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
              <span className="stat-value">{completedOrders.length}</span>
              <span className="stat-label">Completed Orders</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{performance.rating}</span>
              <span className="stat-label">Rating</span>
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
    <div className="washer-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <h3>WashPro</h3>
            <span className="logo-subtitle">Professional</span>
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
              <span className="user-name">{user.username || 'Professional'}</span>
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
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <span className="nav-icon orders"></span>
            Orders
            {pendingOrders.length > 0 && <span className="nav-badge">{pendingOrders.length}</span>}
          </button>
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
              {activeTab === 'orders' && 'Order Management'}
              {activeTab === 'profile' && 'Profile Settings'}
            </h1>
          </div>
          <div className="header-right">
            <div className="real-time-indicator">
              <div className={`status-dot ${realTimeUpdates ? 'active' : ''}`}></div>
              <span>Real-time updates</span>
            </div>
          </div>
        </div>
        <div className="dashboard-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'profile' && renderProfile()}
        </div>
      </div>
    </div>
  );
};

export default WasherDashboard;
