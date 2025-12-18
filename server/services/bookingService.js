const Booking = require('../models/Booking');
const Court = require('../models/Court');
const Equipment = require('../models/Equipment');
const Coach = require('../models/Coach');
const Waitlist = require('../models/Waitlist');
const pricingService = require('./pricingService');
const mongoose = require('mongoose');

class BookingService {
  /**
   * Check availability for all resources
   */
  async checkAvailability(date, startTime, endTime, courtId, equipmentList = [], coachId = null) {
    const availability = {
      isAvailable: true,
      conflicts: [],
    };

    // Check court availability
    const courtAvailable = await this.isCourtAvailable(courtId, date, startTime, endTime);
    if (!courtAvailable) {
      availability.isAvailable = false;
      availability.conflicts.push({ resource: 'court', message: 'Court is already booked' });
    }

    // Check equipment availability
    for (const item of equipmentList) {
      const equipmentAvailable = await this.isEquipmentAvailable(
        item.equipmentId,
        item.quantity,
        date,
        startTime,
        endTime
      );
      if (!equipmentAvailable) {
        availability.isAvailable = false;
        availability.conflicts.push({
          resource: 'equipment',
          equipmentId: item.equipmentId,
          message: 'Not enough equipment available',
        });
      }
    }

    // Check coach availability
    if (coachId) {
      const coachAvailable = await this.isCoachAvailable(coachId, date, startTime, endTime);
      if (!coachAvailable) {
        availability.isAvailable = false;
        availability.conflicts.push({ resource: 'coach', message: 'Coach is not available' });
      }
    }

    return availability;
  }

  /**
   * Check if court is available for the time slot
   */
  async isCourtAvailable(courtId, date, startTime, endTime) {
    // Normalize date to start of day in UTC to avoid timezone issues
    const dateStr = typeof date === 'string' ? date.split('T')[0] : date.toISOString().split('T')[0];
    const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
    const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

    console.log('\n=== Checking Court Availability ===');
    console.log('Court ID:', courtId);
    console.log('Date string:', dateStr);
    console.log('Date range:', startOfDay.toISOString(), 'to', endOfDay.toISOString());
    console.log('Requested time:', `${startTime} - ${endTime}`);

    // Use date range query to handle any timezone stored in DB
    const conflictingBookings = await Booking.find({
      court: courtId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'confirmed',
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    console.log('Query conditions:', {
      court: courtId,
      dateRange: `${startOfDay.toISOString()} to ${endOfDay.toISOString()}`,
      status: 'confirmed',
      overlap: `startTime < ${endTime} AND endTime > ${startTime}`
    });
    console.log('Found conflicting bookings:', conflictingBookings.length);
    
    if (conflictingBookings.length > 0) {
      console.log('❌ CONFLICTS DETECTED:');
      conflictingBookings.forEach(b => {
        console.log(`  - Booking ${b._id}: ${b.startTime} - ${b.endTime} on ${b.date.toISOString()}`);
      });
    } else {
      console.log('✅ No conflicts - court is available');
    }

    return conflictingBookings.length === 0;
  }

  /**
   * Check if equipment is available in required quantity
   */
  async isEquipmentAvailable(equipmentId, requestedQuantity, date, startTime, endTime) {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment || equipment.status !== 'available') {
      return false;
    }

    // Normalize date to handle timezone issues
    const dateStr = typeof date === 'string' ? date.split('T')[0] : date.toISOString().split('T')[0];
    const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
    const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

    // Get all bookings for this equipment on this date with time overlap
    const bookings = await Booking.find({
      'equipment.equipmentId': equipmentId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'confirmed',
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    // Calculate used quantity
    let usedQuantity = 0;
    for (const booking of bookings) {
      const equipmentItem = booking.equipment.find(
        (e) => e.equipmentId.toString() === equipmentId.toString()
      );
      if (equipmentItem) {
        usedQuantity += equipmentItem.quantity;
      }
    }

    const availableQuantity = equipment.totalQuantity - usedQuantity;
    return availableQuantity >= requestedQuantity;
  }

  /**
   * Check if coach is available
   */
  async isCoachAvailable(coachId, date, startTime, endTime) {
    const coach = await Coach.findById(coachId);
    if (!coach || coach.status !== 'active') {
      console.log('Coach not found or not active');
      return false;
    }

    // Parse date - handle both Date objects and strings
    const bookingDate = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date);
    const dayOfWeek = bookingDate.getDay();

    console.log('Checking coach availability for:', {
      coachName: coach.name,
      originalDate: date,
      parsedDate: bookingDate,
      dayOfWeek,
      dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
      requestedTime: `${startTime}-${endTime}`,
      coachAvailability: coach.availability
    });

    // Check coach's availability schedule
    const hasAvailability = coach.availability.some((slot) => {
      const withinSlot = this.isTimeWithinSlot(startTime, endTime, slot.startTime, slot.endTime);
      const dayMatch = slot.dayOfWeek === dayOfWeek;
      console.log(`Checking slot: dayOfWeek=${slot.dayOfWeek} (need ${dayOfWeek}), time=${slot.startTime}-${slot.endTime} (need ${startTime}-${endTime}), dayMatch=${dayMatch}, withinSlot=${withinSlot}`);
      return dayMatch && withinSlot;
    });

    if (!hasAvailability) {
      console.log(`❌ Coach ${coach.name} NOT available on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]} at ${startTime}-${endTime}`);
      console.log('Available slots:', coach.availability.map(s => `${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][s.dayOfWeek]} ${s.startTime}-${s.endTime}`).join(', '));
      return false;
    }

    // Normalize date to handle timezone issues
    const dateStr = typeof date === 'string' ? date.split('T')[0] : date.toISOString().split('T')[0];
    const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
    const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      coach: coachId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'confirmed',
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    console.log('Coach conflicting bookings:', conflictingBookings.length);

    return conflictingBookings.length === 0;
  }

  /**
   * Check if requested time is within availability slot
   */
  isTimeWithinSlot(requestStart, requestEnd, slotStart, slotEnd) {
    const requestStartMin = this.timeToMinutes(requestStart);
    const requestEndMin = this.timeToMinutes(requestEnd);
    const slotStartMin = this.timeToMinutes(slotStart);
    const slotEndMin = this.timeToMinutes(slotEnd);

    return requestStartMin >= slotStartMin && requestEndMin <= slotEndMin;
  }

  /**
   * Convert time to minutes
   */
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Calculate duration between start and end time
   */
  calculateDuration(startTime, endTime) {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    return (endMinutes - startMinutes) / 60; // Return hours
  }

  /**
   * Create a new booking (with optional transaction support)
   */
  async createBooking(bookingData) {
    // Try to use transactions, but fall back to regular operations if not supported
    let session = null;
    let useTransaction = false;

    try {
      // Check if we're connected to a replica set
      const adminDb = mongoose.connection.db.admin();
      const serverStatus = await adminDb.serverStatus();
      useTransaction = serverStatus.repl && serverStatus.repl.setName;
    } catch (error) {
      console.log('Transactions not supported, using regular operations');
      useTransaction = false;
    }

    if (useTransaction) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    try {
      const {
        userId,
        userName,
        userEmail,
        userPhone,
        date,
        startTime,
        endTime,
        courtId,
        equipment = [],
        coachId,
      } = bookingData;

      console.log('\n=== Creating Booking ===');
      console.log('User:', userName);
      console.log('Court:', courtId);
      console.log('Date:', date);
      console.log('Time:', `${startTime} - ${endTime}`);
      console.log('Equipment:', equipment.length);
      console.log('Coach:', coachId || 'None');

      // Calculate duration
      const duration = this.calculateDuration(startTime, endTime);

      // CRITICAL: Double-check availability RIGHT before creating
      // This prevents race conditions
      console.log('Running final availability check...');
      const availability = await this.checkAvailability(
        date,
        startTime,
        endTime,
        courtId,
        equipment,
        coachId
      );

      if (!availability.isAvailable) {
        console.log('❌ Booking rejected - conflicts found:', availability.conflicts);
        throw new Error(`Booking not available: ${JSON.stringify(availability.conflicts)}`);
      }

      console.log('✅ Availability confirmed, proceeding with booking...');

      // Fetch resource details
      const court = session 
        ? await Court.findById(courtId).session(session)
        : await Court.findById(courtId);
      
      if (!court || court.status !== 'active') {
        throw new Error('Court not available');
      }

      const equipmentDetails = [];
      for (const item of equipment) {
        const equip = session
          ? await Equipment.findById(item.equipmentId).session(session)
          : await Equipment.findById(item.equipmentId);
        
        if (equip && equip.status === 'available') {
          equipmentDetails.push({
            equipment: equip,
            quantity: item.quantity,
          });
        }
      }

      let coachDetails = null;
      if (coachId) {
        coachDetails = session
          ? await Coach.findById(coachId).session(session)
          : await Coach.findById(coachId);
        
        if (!coachDetails || coachDetails.status !== 'active') {
          throw new Error('Coach not available');
        }
      }

      // Calculate pricing
      const pricing = await pricingService.calculatePrice({
        court,
        equipment: equipmentDetails,
        coach: coachDetails,
        date,
        startTime,
        endTime,
        duration,
      });

      // Normalize date for consistent storage (always store as start of day in UTC)
      const dateStr = typeof date === 'string' ? date.split('T')[0] : date.toISOString().split('T')[0];
      const normalizedDate = new Date(dateStr + 'T00:00:00.000Z');

      // Create booking
      const booking = new Booking({
        userId,
        userName,
        userEmail,
        userPhone,
        date: normalizedDate,
        startTime,
        endTime,
        duration,
        court: courtId,
        equipment: equipment.map((item) => ({
          equipmentId: item.equipmentId,
          quantity: item.quantity,
        })),
        coach: coachId || undefined,
        pricing,
        status: 'confirmed',
      });

      console.log('Saving booking with date:', normalizedDate.toISOString());

      if (session) {
        await booking.save({ session });
        await session.commitTransaction();
        session.endSession();
      } else {
        await booking.save();
      }

      // Populate and return
      await booking.populate(['court', 'equipment.equipmentId', 'coach']);
      
      // Notify waitlist if applicable
      this.notifyWaitlist(date, startTime, endTime, courtId);

      return booking;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw error;
    }
  }

  /**
   * Cancel a booking and notify waitlist
   */
  async cancelBooking(bookingId, userId) {
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new Error('Unauthorized to cancel this booking');
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking already cancelled');
    }

    booking.status = 'cancelled';
    await booking.save();

    // Notify waitlist
    await this.notifyWaitlist(booking.date, booking.startTime, booking.endTime, booking.court);

    return booking;
  }

  /**
   * Notify next person in waitlist
   */
  async notifyWaitlist(date, startTime, endTime, courtId) {
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    const waitlistEntry = await Waitlist.findOne({
      date: bookingDate,
      startTime,
      endTime,
      court: courtId,
      status: 'waiting',
    }).sort({ createdAt: 1 });

    if (waitlistEntry) {
      waitlistEntry.status = 'notified';
      waitlistEntry.notifiedAt = new Date();
      waitlistEntry.expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min expiry
      await waitlistEntry.save();

      // In a real app, send email/SMS notification here
      console.log(`Notified waitlist user: ${waitlistEntry.userEmail}`);
    }
  }
}

module.exports = new BookingService();
