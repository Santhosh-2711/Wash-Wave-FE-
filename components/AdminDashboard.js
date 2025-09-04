import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalWashers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    completedOrders: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('customer');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState(3);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [allCustomers, setAllCustomers] = useState([]);
  const [allWashers, setAllWashers] = useState([]);
  const [viewMode, setViewMode] = useState('search');

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
    fetchPendingPayments();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('Fetching stats from API...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        throw new Error('No authentication token');
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      console.log('Using headers:', headers);
      
      // Fetch customer count
      console.log('Fetching customer count...');
      const customerResponse = await axios.get('http://localhost:8088/auth/admin/customers/count', { headers });
      console.log('Customer count response:', customerResponse.data);
      
      // Fetch washer count
      console.log('Fetching washer count...');
      const washerResponse = await axios.get('http://localhost:8088/auth/admin/washers/count', { headers });
      console.log('Washer count response:', washerResponse.data);
      
      // Fetch pending orders (optional - may fail)
      let pendingOrdersCount = 0;
      try {
        console.log('Fetching pending orders...');
        const pendingOrdersResponse = await axios.get('http://localhost:8088/bookings/washer/pending', { headers });
        console.log('Pending orders response:', pendingOrdersResponse.data);
        pendingOrdersCount = Array.isArray(pendingOrdersResponse.data) ? pendingOrdersResponse.data.length : pendingOrdersResponse.data;
      } catch (pendingError) {
        console.warn('Failed to fetch pending orders:', pendingError.message);
        pendingOrdersCount = 2;
      }
      
      setStats({
        totalCustomers: customerResponse.data || 0,
        totalWashers: washerResponse.data || 0,
        pendingOrders: pendingOrdersCount,
        totalRevenue: 1250,
        completedOrders: 1
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      // Fallback to mock data if API fails
      setStats({
        totalCustomers: 1247,
        totalWashers: 89,
        pendingOrders: 2,
        totalRevenue: 1250,
        completedOrders: 1
      });
    }
  };

  const fetchRecentActivity = () => {
    setRecentActivity([
      { id: 1, type: 'order', message: 'New order #1234 received', time: '2 min ago', status: 'new' },
      { id: 2, type: 'user', message: 'New customer registered: John Doe', time: '15 min ago', status: 'info' },
      { id: 3, type: 'payment', message: 'Payment of ₹500 received', time: '1 hour ago', status: 'success' },
      { id: 4, type: 'washer', message: 'Washer completed service #1230', time: '2 hours ago', status: 'completed' }
    ]);
  };

  const fetchPendingPayments = async () => {
    try {
      // Mock data - replace with actual API call
      setPendingPayments([
        {
          id: 'PAY001',
          orderId: 'ORD1234',
          customerName: 'John Doe',
          amount: 500,
          paymentMethod: 'Razorpay',
          transactionId: 'pay_MkL9J8K7H6G5F4',
          timestamp: '2024-01-15 14:30:00',
          status: 'PENDING'
        },
        {
          id: 'PAY002',
          orderId: 'ORD1235',
          customerName: 'Jane Smith',
          amount: 750,
          paymentMethod: 'Razorpay',
          transactionId: 'pay_NmO0P9Q8R7S6T5',
          timestamp: '2024-01-15 15:45:00',
          status: 'PENDING'
        }
      ]);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const mockResults = [
        {
          id: 1001,
          username: 'john_doe',
          email: 'john.doe@example.com',
          phoneNumber: '+91 9876543210',
          role: searchType.toUpperCase(),
          status: 'Active',
          joinDate: '2024-01-15',
          lastActive: '2 hours ago'
        },
        {
          id: 1002,
          username: 'jane_smith',
          email: 'jane.smith@example.com',
          phoneNumber: '+91 9876543211',
          role: searchType.toUpperCase(),
          status: 'Active',
          joinDate: '2024-02-20',
          lastActive: '1 day ago'
        }
      ]; 
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('This action cannot be undone. Are you sure you want to delete this user?')) {
      try {
        console.log('Deleting user:', userId);
        setSearchResults(prev => prev.filter(user => user.id !== userId));
        alert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handlePaymentVerification = async (paymentId, action) => {
    if (window.confirm(`Are you sure you want to ${action.toLowerCase()} this payment?`)) {
      setPaymentLoading(true);
      try {
        // API call to verify/reject payment
        console.log(`${action} payment:`, paymentId);
        
        // Remove from pending payments
        setPendingPayments(prev => prev.filter(payment => payment.id !== paymentId));
        
        // Update stats
        if (action === 'VERIFIED') {
          setStats(prev => ({
            ...prev,
            totalRevenue: prev.totalRevenue + pendingPayments.find(p => p.id === paymentId)?.amount || 0
          }));
        }
        
        alert(`Payment ${action.toLowerCase()} successfully`);
      } catch (error) {
        console.error('Error processing payment:', error);
        alert('Failed to process payment');
      } finally {
        setPaymentLoading(false);
      }
    }
  };

  const fetchAllCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8088/auth/admin/customers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAllCustomers(response.data);
    } catch (error) {
      console.error('Error fetching all customers:', error);
      setAllCustomers([
        { id: 1, username: 'john_doe', email: 'john@example.com', phoneNumber: '+91 9876543210', status: 'Active', joinDate: '2024-01-15' },
        { id: 2, username: 'jane_smith', email: 'jane@example.com', phoneNumber: '+91 9876543211', status: 'Active', joinDate: '2024-02-20' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllWashers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8088/auth/admin/washers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAllWashers(response.data);
    } catch (error) {
      console.error('Error fetching all washers:', error);
      setAllWashers([
        { id: 3, username: 'washer_mike', email: 'mike@example.com', phoneNumber: '+91 9876543212', status: 'Active', joinDate: '2024-01-10' },
        { id: 4, username: 'washer_sara', email: 'sara@example.com', phoneNumber: '+91 9876543213', status: 'Active', joinDate: '2024-02-15' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      navigate('/login');
    }
  };

  const MetricCard = ({ title, value, change, icon, trend }) => (
    <div className="metric-card">
      <div className="metric-header">
        <div className="metric-icon">{icon}</div>
        <div className={`metric-trend ${trend}`}>
          {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
        </div>
      </div>
      <div className="metric-content">
        <h3>{value}</h3>
        <p>{title}</p>
        <span className={`metric-change ${trend}`}>{change}</span>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">WW</div>
            <div className="logo-text">
              <h3>Wash Wave</h3>
              <span>Admin Portal</span>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-title">MAIN</span>
            <button 
              className={activeTab === 'dashboard' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="nav-icon">📊</span>
              <span>Dashboard</span>
            </button>
            <button 
              className={activeTab === 'analytics' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveTab('analytics')}
            >
              <span className="nav-icon">📈</span>
              <span>Analytics</span>
            </button>
          </div>
          
          <div className="nav-section">
            <span className="nav-title">MANAGEMENT</span>
            <button 
              className={activeTab === 'users' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveTab('users')}
            >
              <span className="nav-icon">👥</span>
              <span>Users</span>
            </button>
            <button 
              className={activeTab === 'orders' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveTab('orders')}
            >
              <span className="nav-icon">📋</span>
              <span>Orders</span>
            </button>
            <button 
              className={activeTab === 'washers' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveTab('washers')}
            >
              <span className="nav-icon">🧽</span>
              <span>Washers</span>
            </button>
            <button 
              className={activeTab === 'payments' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveTab('payments')}
            >
              <span className="nav-icon">💳</span>
              <span>Payments</span>
            </button>
          </div>
          
          <div className="nav-section">
            <span className="nav-title">SYSTEM</span>
            <button 
              className={activeTab === 'settings' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveTab('settings')}
            >
              <span className="nav-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="main-header">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
            <p>Welcome back, Administrator</p>
          </div>
          <div className="header-right">
            <div className="header-actions">
              <button className="notification-btn">
                🔔
                {notifications > 0 && <span className="notification-badge">{notifications}</span>}
              </button>
              <div className="admin-profile">
                <div className="profile-info">
                  <span className="profile-name">Admin User</span>
                  <span className="profile-role">System Administrator</span>
                </div>
                <div className="profile-avatar">AU</div>
              </div>
            </div>
          </div>
        </header>

        <div className="main-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard-content">
              <div className="metrics-grid">
                <MetricCard 
                  title="Total Customers" 
                  value={stats.totalCustomers.toLocaleString()} 
                  
                  icon="👥" 
                  trend="up"
                />
                <MetricCard 
                  title="Total Washers" 
                  value={stats.totalWashers} 
                  
                  icon="👷" 
                  trend="up"
                />
                <MetricCard 
                  title="Pending Orders" 
                  value={stats.pendingOrders} 
                  
                  icon="⏳" 
                  trend="down"
                />
                <MetricCard 
                  title="Total Revenue" 
                  value={`₹${(stats.totalRevenue ).toLocaleString()}`} 
                  
                  icon="💰" 
                  trend="up"
                />
                <MetricCard 
                  title="Completed Orders" 
                  value={stats.completedOrders.toLocaleString()} 
                  
                  icon="✅" 
                  trend="up"
                />
              </div>

              <div className="dashboard-widgets">
                <div className="widget recent-activity">
                  <div className="widget-header">
                    <h3>Recent Activity</h3>
                    <button className="widget-action">View All</button>
                  </div>
                  <div className="activity-list">
                    {recentActivity.map(activity => (
                      <div key={activity.id} className="activity-item">
                        <div className={`activity-indicator ${activity.status}`}></div>
                        <div className="activity-content">
                          <p>{activity.message}</p>
                          <span className="activity-time">{activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="widget quick-stats">
                  <div className="widget-header">
                    <h3>Quick Stats</h3>
                  </div>
                  <div className="quick-stats-grid">
                    <div className="quick-stat">
                      <span className="stat-label">Today's Orders</span>
                      <span className="stat-value">47</span>
                    </div>
                    <div className="quick-stat">
                      <span className="stat-label">Online Washers</span>
                      <span className="stat-value">23</span>
                    </div>
                    <div className="quick-stat">
                      <span className="stat-label">Avg. Rating</span>
                      <span className="stat-value">4.8</span>
                    </div>
                    <div className="quick-stat">
                      <span className="stat-label">Response Time</span>
                      <span className="stat-value">12m</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-content">
              <div className="content-header">
                <h2>User Management</h2>
                <p>Search, view, and manage system users</p>
              </div>
              
              <div className="search-panel">
                <div className="user-management-tabs">
                  <button 
                    className={viewMode === 'search' ? 'tab-btn active' : 'tab-btn'}
                    onClick={() => setViewMode('search')}
                  >
                    🔍 Search Users
                  </button>
                  <button 
                    className={viewMode === 'all-customers' ? 'tab-btn active' : 'tab-btn'}
                    onClick={() => {
                      setViewMode('all-customers');
                      fetchAllCustomers();
                    }}
                  >
                    👥 All Customers
                  </button>
                  <button 
                    className={viewMode === 'all-washers' ? 'tab-btn active' : 'tab-btn'}
                    onClick={() => {
                      setViewMode('all-washers');
                      fetchAllWashers();
                    }}
                  >
                    🧽 All Washers
                  </button>
                </div>
                
                {viewMode === 'search' && (
                  <div className="search-form">
                    <div className="form-group">
                      <label>User Type</label>
                      <select 
                        value={searchType} 
                        onChange={(e) => setSearchType(e.target.value)}
                        className="form-select"
                      >
                        <option value="customer">Customer</option>
                        <option value="washer">Washer</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Search Query</label>
                      <input
                        type="text"
                        placeholder="Enter User ID, Username, or Email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <button 
                        onClick={handleSearch} 
                        disabled={loading}
                        className="btn-primary"
                      >
                        {loading ? 'Searching...' : 'Search Users'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {viewMode === 'search' && searchResults.length > 0 && (
                <div className="results-panel">
                  <div className="panel-header">
                    <h3>Search Results ({searchResults.length})</h3>
                  </div>
                  <div className="data-table">
                    <table>
                      <thead>
                        <tr>
                          <th>User ID</th>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Join Date</th>
                          <th>Last Active</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map(user => (
                          <tr key={user.id}>
                            <td><span className="user-id">#{user.id}</span></td>
                            <td><strong>{user.username}</strong></td>
                            <td>{user.email}</td>
                            <td>{user.phoneNumber}</td>
                            <td>
                              <span className={`status-badge ${user.role.toLowerCase()}`}>
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${user.status.toLowerCase()}`}>
                                {user.status}
                              </span>
                            </td>
                            <td>{user.joinDate}</td>
                            <td>{user.lastActive}</td>
                            <td>
                              <div className="action-buttons">
                                <button className="btn-view" title="View Details">👁️</button>
                                <button className="btn-edit" title="Edit User">✏️</button>
                                <button 
                                  className="btn-delete" 
                                  title="Delete User"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {viewMode === 'all-customers' && (
                <div className="results-panel">
                  <div className="panel-header">
                    <h3>All Customers ({allCustomers.length})</h3>
                  </div>
                  {loading ? (
                    <div className="loading-state">Loading customers...</div>
                  ) : (
                    <div className="data-table">
                      <table>
                        <thead>
                          <tr>
                            <th>User ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Join Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allCustomers.map(customer => (
                            <tr key={customer.id}>
                              <td><span className="user-id">#{customer.id}</span></td>
                              <td><strong>{customer.username}</strong></td>
                              <td>{customer.email}</td>
                              <td>{customer.phoneNumber}</td>
                              <td>
                                <span className={`status-badge ${customer.status?.toLowerCase() || 'active'}`}>
                                  {customer.status || 'Active'}
                                </span>
                              </td>
                              <td>{customer.joinDate}</td>
                              <td>
                                <div className="action-buttons">
                                  <button className="btn-view" title="View Details">👁️</button>
                                  <button className="btn-edit" title="Edit Customer">✏️</button>
                                  <button 
                                    className="btn-delete" 
                                    title="Delete Customer"
                                    onClick={() => handleDeleteUser(customer.id)}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              
              {viewMode === 'all-washers' && (
                <div className="results-panel">
                  <div className="panel-header">
                    <h3>All Washers ({allWashers.length})</h3>
                  </div>
                  {loading ? (
                    <div className="loading-state">Loading washers...</div>
                  ) : (
                    <div className="data-table">
                      <table>
                        <thead>
                          <tr>
                            <th>User ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Join Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allWashers.map(washer => (
                            <tr key={washer.id}>
                              <td><span className="user-id">#{washer.id}</span></td>
                              <td><strong>{washer.username}</strong></td>
                              <td>{washer.email}</td>
                              <td>{washer.phoneNumber}</td>
                              <td>
                                <span className={`status-badge ${washer.status?.toLowerCase() || 'active'}`}>
                                  {washer.status || 'Active'}
                                </span>
                              </td>
                              <td>{washer.joinDate}</td>
                              <td>
                                <div className="action-buttons">
                                  <button className="btn-view" title="View Details">👁️</button>
                                  <button className="btn-edit" title="Edit Washer">✏️</button>
                                  <button 
                                    className="btn-delete" 
                                    title="Delete Washer"
                                    onClick={() => handleDeleteUser(washer.id)}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="payments-content">
              <div className="content-header">
                <h2>Payment Verification</h2>
                <p>Review and verify pending payments</p>
              </div>
              
              {pendingPayments.length > 0 ? (
                <div className="payments-panel">
                  <div className="panel-header">
                    <h3>Pending Payments ({pendingPayments.length})</h3>
                  </div>
                  <div className="payments-grid">
                    {pendingPayments.map(payment => (
                      <div key={payment.id} className="payment-card">
                        <div className="payment-header">
                          <div className="payment-info">
                            <h4>Payment #{payment.id}</h4>
                            <span className="order-ref">Order: {payment.orderId}</span>
                          </div>
                          <div className="payment-amount">₹{payment.amount}</div>
                        </div>
                        
                        <div className="payment-details">
                          <div className="detail-row">
                            <span className="label">Customer:</span>
                            <span className="value">{payment.customerName}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Method:</span>
                            <span className="value">{payment.paymentMethod}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Transaction ID:</span>
                            <span className="value transaction-id">{payment.transactionId}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Time:</span>
                            <span className="value">{payment.timestamp}</span>
                          </div>
                        </div>
                        
                        <div className="payment-actions">
                          <button 
                            className="btn-verify"
                            onClick={() => handlePaymentVerification(payment.id, 'VERIFIED')}
                            disabled={paymentLoading}
                          >
                            ✅ Verify
                          </button>
                          <button 
                            className="btn-reject"
                            onClick={() => handlePaymentVerification(payment.id, 'REJECTED')}
                            disabled={paymentLoading}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">💳</div>
                  <h3>No Pending Payments</h3>
                  <p>All payments have been processed</p>
                </div>
              )}
            </div>
          )}

          {(activeTab === 'orders' || activeTab === 'washers' || activeTab === 'analytics' || activeTab === 'settings') && (
            <div className="placeholder-content">
              <div className="placeholder-icon">🚧</div>
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</h2>
              <p>This section is under development and will be available soon.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;