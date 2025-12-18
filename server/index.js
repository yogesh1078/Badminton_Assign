const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/badminton-booking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courts', require('./routes/courtRoutes'));
app.use('/api/equipment', require('./routes/equipmentRoutes'));
app.use('/api/coaches', require('./routes/coachRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/pricing-rules', require('./routes/pricingRuleRoutes'));
app.use('/api/availability', require('./routes/availabilityRoutes'));
app.use('/api/waitlist', require('./routes/waitlistRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Badminton Booking API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
