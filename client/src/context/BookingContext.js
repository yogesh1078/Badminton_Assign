import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Load user from localStorage (set after login)
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const resetSelection = () => {
    setSelectedCourt(null);
    setSelectedEquipment([]);
    setSelectedCoach(null);
    setSelectedSlot(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    resetSelection();
  };

  const value = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
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
    resetSelection,
    logout,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
