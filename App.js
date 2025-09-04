import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Features from './components/Features';
import ServiceAreas from './components/ServiceAreas';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import Register from './components/Register';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ErrorPage from './components/ErrorPage';
import CustomerDashboard from './components/CustomerDashboard';
import WasherDashboard from './components/WasherDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/App.css';

const LandingPage = () => {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role;
    if (role === 'ADMIN') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (role === 'WASHER') {
      return <Navigate to="/washer-dashboard" replace />;
    } else {
      return <Navigate to="/customer-dashboard" replace />;
    }
  }
  return (
    <>
      <Header />
      <Hero />
      <Services />
      <Features />
      <ServiceAreas />
      <Testimonials />
      <Footer />
    </>
  );
};

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role;
    if (role === 'ADMIN') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (role === 'WASHER') {
      return <Navigate to="/washer-dashboard" replace />;
    } else {
      return <Navigate to="/customer-dashboard" replace />;
    }
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/customer-dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/washer-dashboard" element={<ProtectedRoute><WasherDashboard /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;