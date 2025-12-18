import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { 
  getCourts, 
  getEquipment, 
  getCoaches, 
  getAvailableSlots,
  getPricingPreview,
  createBooking,
  addToWaitlist
} from '../services/api';
import { format } from 'date-fns';

const BookingPage = () => {
  const navigate = useNavigate();
  const { 
    user,
    isAuthenticated,
    selectedDate, 
    setSelectedDate,
    selectedCourt,
    setSelectedCourt,
    selectedEquipment,
    setSelectedEquipment,
    selectedCoach,
    setSelectedCoach,
    selectedSlot,
    setSelectedSlot,
    resetSelection
  } = useBooking();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const [courts, setCourts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [slots, setSlots] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Load courts
  useEffect(() => {
    const loadCourts = async () => {
      try {
        const response = await getCourts();
        setCourts(response.data.data);
      } catch (error) {
        console.error('Error loading courts:', error);
      }
    };
    loadCourts();
  }, []);

  // Load equipment
  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const response = await getEquipment();
        setEquipment(response.data.data);
      } catch (error) {
        console.error('Error loading equipment:', error);
      }
    };
    loadEquipment();
  }, []);

  // Load coaches
  useEffect(() => {
    const loadCoaches = async () => {
      try {
        const response = await getCoaches();
        setCoaches(response.data.data);
      } catch (error) {
        console.error('Error loading coaches:', error);
      }
    };
    loadCoaches();
  }, []);

  // Load available slots when court and date change
  useEffect(() => {
    if (selectedCourt && selectedDate) {
      loadSlots();
    }
  }, [selectedCourt, selectedDate]);

  // Update pricing preview when selections change
  useEffect(() => {
    if (selectedCourt && selectedSlot) {
      updatePricingPreview();
    }
  }, [selectedCourt, selectedSlot, selectedEquipment, selectedCoach]);

  const loadSlots = async () => {
    try {
      const response = await getAvailableSlots({
        date: selectedDate,
        courtId: selectedCourt._id,
      });
      setSlots(response.data.data);
    } catch (error) {
      console.error('Error loading slots:', error);
    }
  };

  const updatePricingPreview = async () => {
    try {
      const response = await getPricingPreview({
        courtId: selectedCourt._id,
        equipment: selectedEquipment.map(e => ({
          equipmentId: e.equipmentId,
          quantity: e.quantity
        })),
        coachId: selectedCoach?._id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });
      setPricing(response.data.data);
    } catch (error) {
      console.error('Error getting pricing:', error);
    }
  };

  const handleCourtSelect = (court) => {
    setSelectedCourt(court);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    if (slot.available) {
      setSelectedSlot(slot);
    }
  };

  const handleEquipmentToggle = (equip) => {
    const existing = selectedEquipment.find(e => e.equipmentId === equip._id);
    if (existing) {
      setSelectedEquipment(selectedEquipment.filter(e => e.equipmentId !== equip._id));
    } else {
      setSelectedEquipment([...selectedEquipment, {
        equipmentId: equip._id,
        equipment: equip,
        quantity: 1
      }]);
    }
  };

  const handleEquipmentQuantity = (equipId, delta) => {
    setSelectedEquipment(selectedEquipment.map(e => {
      if (e.equipmentId === equipId) {
        const newQuantity = Math.max(1, Math.min(e.quantity + delta, e.equipment.totalQuantity));
        return { ...e, quantity: newQuantity };
      }
      return e;
    }));
  };

  const handleCoachSelect = (coach) => {
    setSelectedCoach(selectedCoach?._id === coach._id ? null : coach);
  };

  const handleBooking = async () => {
    if (!selectedCourt || !selectedSlot) {
      setMessage({ type: 'error', text: 'Please select a court and time slot' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const bookingData = {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        courtId: selectedCourt._id,
        equipment: selectedEquipment.map(e => ({
          equipmentId: e.equipmentId,
          quantity: e.quantity
        })),
        coachId: selectedCoach?._id,
      };

      const response = await createBooking(bookingData);
      setMessage({ 
        type: 'success', 
        text: `Booking confirmed! Total: ₹${response.data.data.pricing.total}` 
      });
      
      // Reset selections
      resetSelection();
      setPricing(null);
      
      // Reload slots
      if (selectedCourt) {
        loadSlots();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Booking failed';
      
      // If slot is full, offer waitlist
      if (errorMsg.includes('not available') || errorMsg.includes('already booked')) {
        setMessage({ 
          type: 'error', 
          text: errorMsg,
          showWaitlist: true
        });
      } else {
        setMessage({ type: 'error', text: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWaitlist = async () => {
    try {
      await addToWaitlist({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        courtId: selectedCourt._id,
      });
      setMessage({ 
        type: 'success', 
        text: 'Added to waitlist! We\'ll notify you when a slot becomes available.' 
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to join waitlist' 
      });
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="container">
      <h1>Book Your Court</h1>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
          {message.showWaitlist && (
            <button 
              className="btn btn-secondary" 
              onClick={handleJoinWaitlist}
              style={{ marginLeft: '10px' }}
            >
              Join Waitlist
            </button>
          )}
        </div>
      )}

      <div className="booking-flow">
        <div className="booking-steps">
          {/* Step 1: Select Date */}
          <div className="step">
            <h3>
              <span className="step-number">1</span>
              Select Date
            </h3>
            <div className="form-group">
              <input
                type="date"
                value={selectedDate}
                min={getTodayDate()}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {/* Step 2: Select Court */}
          <div className="step">
            <h3>
              <span className="step-number">2</span>
              Select Court
            </h3>
            <div className="court-grid">
              {courts.map((court) => (
                <div
                  key={court._id}
                  className={`court-card ${selectedCourt?._id === court._id ? 'selected' : ''}`}
                  onClick={() => handleCourtSelect(court)}
                >
                  <h4>{court.name}</h4>
                  <p className="badge badge-info">{court.type.toUpperCase()}</p>
                  <p style={{ marginTop: '10px' }}>Base Rate: ₹{court.baseRate}/hr</p>
                  {court.description && <p style={{ fontSize: '12px', color: '#666' }}>{court.description}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Select Time Slot */}
          {selectedCourt && (
            <div className="step">
              <h3>
                <span className="step-number">3</span>
                Select Time Slot
              </h3>
              {slots.length === 0 ? (
                <div className="alert alert-warning" style={{ textAlign: 'center', padding: '20px' }}>
                  <h4>⚠️ No Available Slots</h4>
                  <p>All time slots for this court on {format(new Date(selectedDate), 'MMMM dd, yyyy')} are booked.</p>
                  <p>Please try selecting a different date or court.</p>
                </div>
              ) : (
                <div className="slot-grid">
                  {slots.map((slot, index) => (
                    <button
                      key={index}
                      className={`slot-button ${selectedSlot?.startTime === slot.startTime ? 'selected' : ''}`}
                      onClick={() => handleSlotSelect(slot)}
                      disabled={!slot.available}
                    >
                      {slot.startTime}
                      {!slot.available && <div style={{ fontSize: '10px', color: '#999' }}>Booked</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Add Equipment (Optional) */}
          {selectedSlot && (
            <div className="step">
              <h3>
                <span className="step-number">4</span>
                Add Equipment (Optional)
              </h3>
              <div className="equipment-grid">
                {equipment.map((equip) => {
                  const selected = selectedEquipment.find(e => e.equipmentId === equip._id);
                  return (
                    <div
                      key={equip._id}
                      className="equipment-card"
                      style={{ borderColor: selected ? '#27ae60' : '#e0e0e0' }}
                    >
                      <h4>{equip.name}</h4>
                      <p>₹{equip.rate}/hr</p>
                      <p style={{ fontSize: '12px', color: '#666' }}>Available: {equip.totalQuantity}</p>
                      {selected ? (
                        <div className="equipment-quantity">
                          <button 
                            className="quantity-btn"
                            onClick={() => handleEquipmentQuantity(equip._id, -1)}
                          >
                            -
                          </button>
                          <span>{selected.quantity}</span>
                          <button 
                            className="quantity-btn"
                            onClick={() => handleEquipmentQuantity(equip._id, 1)}
                          >
                            +
                          </button>
                          <button 
                            className="btn btn-danger"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                            onClick={() => handleEquipmentToggle(equip)}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="btn btn-primary"
                          style={{ width: '100%', marginTop: '10px' }}
                          onClick={() => handleEquipmentToggle(equip)}
                        >
                          Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Book Coach (Optional) */}
          {selectedSlot && (
            <div className="step">
              <h3>
                <span className="step-number">5</span>
                Book a Coach (Optional)
              </h3>
              <div className="coach-grid">
                {coaches.map((coach) => (
                  <div
                    key={coach._id}
                    className={`coach-card ${selectedCoach?._id === coach._id ? 'selected' : ''}`}
                    onClick={() => handleCoachSelect(coach)}
                  >
                    <h4>{coach.name}</h4>
                    <p>₹{coach.hourlyRate}/hr</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>{coach.specialization.join(', ')}</p>
                    {coach.bio && <p style={{ fontSize: '11px', marginTop: '5px', color: '#999' }}>{coach.bio}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price Summary */}
        {pricing && (
          <div className="price-summary">
            <h3>Price Breakdown</h3>
            
            <div className="price-item">
              <span>Court ({selectedCourt.name})</span>
              <span>₹{pricing.courtCharge.toFixed(2)}</span>
            </div>

            {pricing.equipmentCharges.map((item, index) => (
              <div key={index} className="price-item">
                <span>{item.equipmentName} (x{item.quantity})</span>
                <span>₹{item.total.toFixed(2)}</span>
              </div>
            ))}

            {pricing.coachCharge > 0 && (
              <div className="price-item">
                <span>Coach ({selectedCoach.name})</span>
                <span>₹{pricing.coachCharge.toFixed(2)}</span>
              </div>
            )}

            {pricing.appliedRules.length > 0 && (
              <>
                <div style={{ marginTop: '15px', marginBottom: '10px', fontWeight: 'bold' }}>
                  Applied Rules:
                </div>
                {pricing.appliedRules.map((rule, index) => (
                  <div key={index} className="price-item" style={{ color: '#e74c3c' }}>
                    <span>{rule.ruleName}</span>
                    <span>+₹{rule.impact.toFixed(2)}</span>
                  </div>
                ))}
              </>
            )}

            <div className="price-item total">
              <span>Total</span>
              <span>₹{pricing.total.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-success"
              style={{ width: '100%', marginTop: '20px', fontSize: '18px' }}
              onClick={handleBooking}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
