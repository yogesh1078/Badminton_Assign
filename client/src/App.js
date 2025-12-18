import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { BookingProvider, useBooking } from './context/BookingContext';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

function Navigation() {
  const { user, logout, isAuthenticated } = useBooking();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-brand">
          <h2>🏸 Badminton Booking</h2>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/book">Book Now</Link></li>
          {isAuthenticated && (
            <>
              <li><Link to="/my-bookings">My Bookings</Link></li>
              {user?.role === 'admin' && (
                <li><Link to="/admin">Admin</Link></li>
              )}
            </>
          )}
          {!isAuthenticated ? (
            <>
              <li><Link to="/login" className="btn-login">Login</Link></li>
              <li><Link to="/register" className="btn-register">Register</Link></li>
            </>
          ) : (
            <li>
              <span className="user-info">👤 {user?.name}</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BookingProvider>
      <Router>
        <div className="App">
          <Navigation />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/book" element={<BookingPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>

          <footer className="footer">
            <div className="container">
              <p>&copy; 2025 Badminton Court Booking System. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </Router>
    </BookingProvider>
  );
}

export default App;
