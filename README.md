# 🏸 Badminton Court Booking System

A comprehensive full-stack MERN application for managing badminton court bookings with dynamic pricing, multi-resource booking, and intelligent waitlist management.

[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.2+-blue.svg)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Node-16+-green.svg)](https://nodejs.org/)

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)

##  Features

### Core Features
- ** Multi-Resource Booking**: Book courts + equipment + coaches in one atomic transaction
- ** Dynamic Pricing Engine**: Configurable rules with time-based, day-based, and type-based conditions
- ** Admin Configuration**: Full CRUD for courts, equipment, coaches, and pricing rules
- **  Real-time Availability**: Live slot checking across all resources
- ** Concurrency Handling**: MongoDB transactions prevent double bookings
- ** Waitlist System**: FIFO queue management with automatic notifications

### Pricing Features
- Peak hour multipliers (6 PM - 9 PM: 1.5x)
- Weekend surcharges (1.3x)
- Court type premiums (Indoor: +₹200)
- Rule stacking (multiple rules can apply)
- Transparent price breakdown
- Priority-based rule application

### User Experience
- Multi-step booking flow with progress indicators
- Live price preview as you select options
- Booking history with status tracking
- One-click cancellations
- Quantity controls for equipment
- Coach availability visualization

##  Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (v5+)
- npm or yarn

### Installation

```bash
# 1. Install all dependencies
npm run install-all

# 2. Configure environment (already created)
# Check .env file - default settings work for local development

# 3. Seed the database with initial data
npm run seed

# 4. Start both backend and frontend
npm run dev
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

### Default Seeded Data
- **4 Courts**: 2 Indoor (₹500/hr), 2 Outdoor (₹300/hr)
- **4 Equipment Types**: Rackets, Shoes, Shuttlecocks
- **3 Coaches**: ₹200-300/hr with varied schedules
- **3 Pricing Rules**: Peak hour, Weekend, Indoor premium

##  Documentation

Comprehensive guides available:

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Installation, configuration, and testing
- **[TECHNICAL_DOCS.md](TECHNICAL_DOCS.md)** - Architecture deep dive and implementation details
- **[FEATURE_DEMO.md](FEATURE_DEMO.md)** - Step-by-step testing scenarios
- **[API_TESTING.md](API_TESTING.md)** - curl commands and Postman collection
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and FAQ
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Quick overview and highlights

##  Tech Stack

### Backend
- **Runtime**: Node.js v16+
- **Framework**: Express.js v4.18
- **Database**: MongoDB v5+ with Mongoose ODM
- **Features**: RESTful API, Transaction support, Service layer pattern

### Frontend
- **Library**: React v18.2
- **Router**: React Router v6
- **State**: Context API
- **HTTP**: Axios
- **Styling**: CSS3 with modern flexbox/grid

### Development
- **Concurrency**: Concurrently for running both servers
- **Hot Reload**: Nodemon (backend), React Scripts (frontend)
- **Code Style**: Modern ES6+ JavaScript

##  Project Structure

```
badminton-booking-system/
├── server/                      # Backend (Node.js + Express)
│   ├── models/                  # Mongoose schemas
│   │   ├── Court.js            # Court model
│   │   ├── Equipment.js        # Equipment model
│   │   ├── Coach.js            # Coach model
│   │   ├── Booking.js          # Booking model (central)
│   │   ├── PricingRule.js      # Dynamic pricing rules
│   │   └── Waitlist.js         # Waitlist queue
│   ├── controllers/             # Request handlers
│   │   ├── bookingController.js
│   │   ├── availabilityController.js
│   │   ├── adminController.js
│   │   └── waitlistController.js
│   ├── services/            # Business logic layer
│   │   ├── bookingService.js   # Core booking logic
│   │   └── pricingService.js   # Pricing calculation engine
│   ├── routes/                  # API route definitions
│   │   ├── bookingRoutes.js
│   │   ├── availabilityRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── courtRoutes.js
│   │   ├── equipmentRoutes.js
│   │   ├── coachRoutes.js
│   │   ├── pricingRuleRoutes.js
│   │   └── waitlistRoutes.js
│   ├── seed.js                  # Database seeding script
│   └── index.js                 # Server entry point
├── client/                      # Frontend (React)
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── pages/               # Page components
│       │   ├── HomePage.js      # Landing page
│       │   ├── BookingPage.js   # Main booking interface
│       │   ├── MyBookingsPage.js # User bookings
│       │   └── AdminPage.js     # Admin panel
│       ├── context/             # Global state
│       │   └── BookingContext.js
│       ├── services/            # API integration
│       │   └── api.js           # Axios instance + endpoints
│       ├── App.js               # Main app component
│       ├── App.css              # App-level styles
│       ├── index.js             # React entry point
│       └── index.css            # Global styles
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore
├── package.json                 # Root dependencies
├── README.md                    # This file
├── SETUP_GUIDE.md              # Installation guide
├── TECHNICAL_DOCS.md           # Architecture docs
├── FEATURE_DEMO.md             # Testing guide
├── API_TESTING.md              # API reference
├── TROUBLESHOOTING.md          # FAQ & issues
└── PROJECT_SUMMARY.md          # Quick overview
```

**Total Files:** ~40 across backend, frontend, and documentation



### User Interface
- Home page with features
- Step-by-step booking flow
- Live pricing breakdown
- Booking history
- Admin dashboard



#### Booking Endpoints
```bash
POST   /api/bookings                    # Create booking
GET    /api/bookings/user/:userId       # Get user bookings
GET    /api/bookings/:id                # Get booking details
DELETE /api/bookings/:id                # Cancel booking
POST   /api/bookings/pricing-preview    # Get price estimate
```

#### Availability Endpoints
```bash
GET /api/availability/check             # Check specific availability
GET /api/availability/slots             # Get available time slots
GET /api/availability/resources         # Get all resources
```

#### Resource Endpoints
```bash
GET /api/courts                         # Get all courts
GET /api/equipment                      # Get all equipment
GET /api/coaches                        # Get all coaches
GET /api/pricing-rules                  # Get pricing rules
```

#### Admin Endpoints
```bash
POST   /api/admin/courts                # Create court
PUT    /api/admin/courts/:id            # Update court
DELETE /api/admin/courts/:id            # Delete court
# Similar patterns for equipment, coaches, pricing-rules
```

#### Waitlist Endpoints
```bash
POST   /api/waitlist                    # Join waitlist
GET    /api/waitlist/user/:userId       # Get user waitlist
DELETE /api/waitlist/:id                # Remove from waitlist
```

**Full API documentation:** See [API_TESTING.md](API_TESTING.md)

##  Testing

### Quick Test
```bash
# 1. Seed database
npm run seed

# 2. Start servers
npm run dev

# 3. Navigate to http://localhost:3000
# 4. Follow test scenarios in FEATURE_DEMO.md
```

### Testing Scenarios
- **Basic Booking**: Weekday, non-peak, outdoor court → ₹300
- **Peak Hour**: Same court at 7 PM → ₹450 (1.5x)
- **Weekend + Peak + Indoor**: Saturday 8 PM, Indoor → ₹1,600
- **Multi-Resource**: Court + 2 rackets + coach → Dynamic total
- **Concurrency**: Two simultaneous bookings → One succeeds
- **Waitlist**: Full slot → Join queue → Get notified on cancellation

**Detailed scenarios:** See [FEATURE_DEMO.md](FEATURE_DEMO.md)

##  Security Notes

**Current Implementation:**
- No authentication (uses mock user)
- No authorization (all users can access admin)
- No rate limiting
- CORS enabled for all origins

**For Production:**
-  Add JWT authentication
-  Implement RBAC for admin routes
-  Add rate limiting (express-rate-limit)
-  Enable HTTPS
-  Sanitize inputs
-  Use helmet for security headers
-  Restrict CORS to specific origins

##  Deployment

### Backend (Heroku/Railway)
```bash
# Set environment variables
PORT=5000
MONGODB_URI=<your-mongodb-atlas-uri>
NODE_ENV=production

# Deploy
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Upload build/ directory to hosting service
```

**Update API URL:**
```javascript
// client/src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || '/api';
```

##  Contributing

This is an assignment project. For production use:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request


##  Learning Outcomes

This project demonstrates:
-  Complex database schema design
-  Business logic separation (services layer)
-  MongoDB transactions for atomicity
-  Dynamic rule engine implementation
-  RESTful API design principles
-  React state management (Context API)
-  Multi-step user interfaces
-  Full-stack integration
-  Comprehensive documentation

##  Support

**Having issues?**
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Ensure MongoDB is running
3. Verify `.env` configuration
4. Check both server logs

##  Acknowledgments

- Built as a full-stack MERN assignment
- Demonstrates production-ready architecture
- Includes comprehensive documentation
- Ready for deployment with minor modifications

---

**Built with ❤️ using MongoDB, Express.js, React, and Node.js**

🏸 Happy Booking! 🏸
