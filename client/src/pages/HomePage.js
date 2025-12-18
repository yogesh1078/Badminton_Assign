import React from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

const HomePage = () => {
  const { isAuthenticated } = useBooking();

  return (
    <div className="container">
      <div className="hero">
        <h1>Welcome to Badminton Court Booking</h1>
        <p>Book your court, rent equipment, and hire professional coaches - all in one place!</p>
        <Link 
          to={isAuthenticated ? "/book" : "/login"} 
          className="btn btn-success" 
          style={{ fontSize: '18px', padding: '15px 40px' }}
        >
          {isAuthenticated ? "Book Now" : "Login to Book"}
        </Link>
      </div>

      <div className="features">
        <div className="feature-card">
          <div className="icon">🏟️</div>
          <h3>Multiple Courts</h3>
          <p>Choose from 4 badminton courts - 2 indoor and 2 outdoor facilities</p>
        </div>

        <div className="feature-card">
          <div className="icon">🎾</div>
          <h3>Equipment Rental</h3>
          <p>Rent professional rackets, shoes, and shuttlecocks at affordable rates</p>
        </div>

        <div className="feature-card">
          <div className="icon">👨‍🏫</div>
          <h3>Expert Coaches</h3>
          <p>Book sessions with 3 certified coaches for all skill levels</p>
        </div>

        <div className="feature-card">
          <div className="icon">💰</div>
          <h3>Dynamic Pricing</h3>
          <p>Transparent pricing with special rates for peak hours and weekends</p>
        </div>

        <div className="feature-card">
          <div className="icon">⏰</div>
          <h3>Real-time Availability</h3>
          <p>Check live court availability and book your preferred time slot instantly</p>
        </div>

        <div className="feature-card">
          <div className="icon">📋</div>
          <h3>Easy Management</h3>
          <p>View and manage all your bookings in one place</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '40px', textAlign: 'center' }}>
        <h2>How It Works</h2>
        <div className="features" style={{ marginTop: '30px', textAlign: 'left' }}>
          <div>
            <h3>1️⃣ Select Date & Court</h3>
            <p>Choose your preferred date and court type (indoor or outdoor)</p>
          </div>
          <div>
            <h3>2️⃣ Pick Time Slot</h3>
            <p>Select an available time slot from our real-time schedule</p>
          </div>
          <div>
            <h3>3️⃣ Add Equipment & Coach</h3>
            <p>Optionally rent equipment or book a coach for your session</p>
          </div>
          <div>
            <h3>4️⃣ Confirm Booking</h3>
            <p>Review pricing breakdown and confirm your booking</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
