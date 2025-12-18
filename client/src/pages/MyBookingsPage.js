import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { getUserBookings, cancelBooking, getUserWaitlist } from '../services/api';
import { format } from 'date-fns';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useBooking();
  const [bookings, setBookings] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userId = user._id || user.id;
      const [bookingsRes, waitlistRes] = await Promise.all([
        getUserBookings(userId),
        getUserWaitlist(userId)
      ]);
      setBookings(bookingsRes.data.data);
      setWaitlist(waitlistRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load bookings' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const userId = user._id || user.id;
      await cancelBooking(bookingId, userId);
      setMessage({ type: 'success', text: 'Booking cancelled successfully' });
      loadData();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to cancel booking' 
      });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: 'badge-success',
      cancelled: 'badge-danger',
      completed: 'badge-info',
    };
    return badges[status] || 'badge-warning';
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading your bookings...</div></div>;
  }

  if (!user) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Please log in to view your bookings</h2>
          <p>You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>My Bookings & Orders</h1>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <button 
          className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('bookings')}
          style={{ marginRight: '10px' }}
        >
          My Bookings ({bookings.length})
        </button>
        <button 
          className={`btn ${activeTab === 'waitlist' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('waitlist')}
        >
          Waitlist ({waitlist.length})
        </button>
      </div>

      {activeTab === 'bookings' ? (
        <div className="bookings-list">
          {bookings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No bookings yet</h3>
              <p>You haven't made any court bookings yet.</p>
              <p style={{ marginTop: '20px' }}>
                <a href="/book" className="btn btn-primary">Make a Booking</a>
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h3>Booking #{booking._id.slice(-6)}</h3>
                  <span className={`badge ${getStatusBadge(booking.status)}`}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>

                <div className="booking-details">
                  <div className="booking-detail-item">
                    <label>Date</label>
                    <span>{format(new Date(booking.date), 'MMMM dd, yyyy')}</span>
                  </div>

                  <div className="booking-detail-item">
                    <label>Time</label>
                    <span>{booking.startTime} - {booking.endTime}</span>
                  </div>

                  <div className="booking-detail-item">
                    <label>Court</label>
                    <span>{booking.court?.name || 'N/A'}</span>
                  </div>

                  <div className="booking-detail-item">
                    <label>Duration</label>
                    <span>{booking.duration} hour(s)</span>
                  </div>
                </div>

                {booking.equipment && booking.equipment.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <label style={{ fontSize: '12px', color: '#7f8c8d' }}>Equipment:</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '5px' }}>
                      {booking.equipment.map((item, idx) => (
                        <span key={idx} className="badge badge-info">
                          {item.equipmentId?.name || 'Equipment'} (x{item.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {booking.coach && (
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ fontSize: '12px', color: '#7f8c8d' }}>Coach:</label>
                    <span style={{ marginLeft: '10px', fontWeight: '500' }}>
                      {booking.coach.name}
                    </span>
                  </div>
                )}

                <div style={{ 
                  marginTop: '15px', 
                  paddingTop: '15px', 
                  borderTop: '1px solid #ecf0f1',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong style={{ fontSize: '18px', color: '#27ae60' }}>
                      Total: ₹{booking.pricing.total.toFixed(2)}
                    </strong>
                  </div>

                  {booking.status === 'confirmed' && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleCancelBooking(booking._id)}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>

                {booking.pricing.appliedRules && booking.pricing.appliedRules.length > 0 && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    <em>
                      Applied: {booking.pricing.appliedRules.map(r => r.ruleName).join(', ')}
                    </em>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bookings-list">
          {waitlist.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <p>No waitlist entries</p>
            </div>
          ) : (
            waitlist.map((entry) => (
              <div key={entry._id} className="booking-card">
                <div className="booking-header">
                  <h3>Waitlist Entry</h3>
                  <span className={`badge badge-warning`}>
                    Position: {entry.position}
                  </span>
                </div>

                <div className="booking-details">
                  <div className="booking-detail-item">
                    <label>Date</label>
                    <span>{format(new Date(entry.date), 'MMMM dd, yyyy')}</span>
                  </div>

                  <div className="booking-detail-item">
                    <label>Time</label>
                    <span>{entry.startTime} - {entry.endTime}</span>
                  </div>

                  <div className="booking-detail-item">
                    <label>Court</label>
                    <span>{entry.court?.name || 'Any'}</span>
                  </div>

                  <div className="booking-detail-item">
                    <label>Status</label>
                    <span className={`badge ${
                      entry.status === 'notified' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {entry.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {entry.status === 'notified' && (
                  <div className="alert alert-info" style={{ marginTop: '15px' }}>
                    A slot is available! Book now before it expires.
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
