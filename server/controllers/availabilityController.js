const bookingService = require('../services/bookingService');
const Court = require('../models/Court');
const Coach = require('../models/Coach');
const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');

const availabilityController = {
  // Check availability for specific resources and time slot
  async checkAvailability(req, res) {
    try {
      const { date, startTime, endTime, courtId, equipment = [], coachId } = req.query;

      const availability = await bookingService.checkAvailability(
        date,
        startTime,
        endTime,
        courtId,
        equipment ? JSON.parse(equipment) : [],
        coachId
      );

      res.json({
        success: true,
        data: availability,
      });
    } catch (error) {
      console.error('Check availability error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Get available slots for a specific date and court
  async getAvailableSlots(req, res) {
    try {
      const { date, courtId, equipment = '[]', coachId } = req.query;
      const equipmentList = JSON.parse(equipment);

      // Normalize date to handle timezone issues - use date range query
      const dateStr = date.split('T')[0];
      const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
      const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

      // Get current time in IST (India Standard Time - UTC+5:30)
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
      const istTime = new Date(now.getTime() + istOffset + (now.getTimezoneOffset() * 60 * 1000));
      
      // Check if booking date is today in IST
      const todayStr = istTime.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      const currentHour = istTime.getHours();
      const currentMinute = istTime.getMinutes();

      // Get all bookings for this court on this date using date range
      const courtBookings = await Booking.find({
        court: courtId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: 'confirmed',
      }).select('startTime endTime equipment coach');

      console.log(`Checking slots for court ${courtId} on ${dateStr}`);
      console.log(`Current IST time: ${istTime.toISOString()} (${currentHour}:${currentMinute})`);
      console.log(`Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
      console.log(`Today's date: ${todayStr}`);
      console.log(`Is today: ${isToday}, Current hour: ${currentHour}:${currentMinute}`);
      console.log(`Found ${courtBookings.length} existing bookings`);

      // Generate time slots (6 AM to 11 PM, 1-hour slots)
      const slots = [];
      for (let hour = 6; hour < 23; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

        // Skip past time slots for today - show only NEXT available slots
        // If current time is 2:30 PM (14:30), skip all slots up to 2:00 PM, show from 3:00 PM
        if (isToday && hour <= currentHour) {
          console.log(`Skipping past slot: ${startTime} (current time: ${currentHour}:${currentMinute})`);
          continue;
        }

        // CRITICAL: Check all resource availability for this slot
        // This ensures we only show truly available slots to users
        
        // Check court availability using the booking service (consistent logic)
        const courtAvailable = await bookingService.isCourtAvailable(
          courtId,
          date,
          startTime,
          endTime
        );

        // Check equipment availability if selected
        let equipmentAvailable = true;
        if (equipmentList.length > 0) {
          for (const item of equipmentList) {
            const available = await bookingService.isEquipmentAvailable(
              item.equipmentId,
              item.quantity,
              date,
              startTime,
              endTime
            );
            if (!available) {
              equipmentAvailable = false;
              console.log(`Equipment ${item.equipmentId} not available for ${startTime}-${endTime}`);
              break;
            }
          }
        }

        // Check coach availability if selected
        let coachAvailable = true;
        if (coachId) {
          coachAvailable = await bookingService.isCoachAvailable(
            coachId,
            date,
            startTime,
            endTime
          );
          if (!coachAvailable) {
            console.log(`Coach ${coachId} not available for ${startTime}-${endTime}`);
          }
        }

        const isAvailable = courtAvailable && equipmentAvailable && coachAvailable;

        slots.push({
          startTime,
          endTime,
          available: isAvailable,
          reasons: {
            courtAvailable,
            equipmentAvailable,
            coachAvailable,
          }
        });
        
        if (!isAvailable) {
          console.log(`Slot ${startTime}-${endTime} unavailable - Court: ${courtAvailable}, Equipment: ${equipmentAvailable}, Coach: ${coachAvailable}`);
        }
      }

      console.log(`Returning ${slots.filter(s => s.available).length} available slots out of ${slots.length}`);

      res.json({
        success: true,
        data: slots,
      });
    } catch (error) {
      console.error('Get available slots error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Get all available resources for a date and time
  async getAvailableResources(req, res) {
    try {
      const { date, startTime, endTime } = req.query;

      // Get all active courts and check availability
      const allCourts = await Court.find({ status: 'active' });
      const availableCourts = [];
      
      for (const court of allCourts) {
        const isAvailable = await bookingService.isCourtAvailable(
          court._id,
          date,
          startTime || '06:00',
          endTime || '23:00'
        );
        if (isAvailable || !startTime) {
          availableCourts.push(court);
        }
      }

      // Get all available equipment with current availability
      const allEquipment = await Equipment.find({ status: 'available' });
      const availableEquipment = [];

      for (const equip of allEquipment) {
        if (!startTime) {
          // If no time specified, return all with total quantity
          availableEquipment.push({
            ...equip.toObject(),
            availableQuantity: equip.totalQuantity,
          });
        } else {
          // Calculate available quantity for the time slot
          const bookingDate = new Date(date);
          bookingDate.setHours(0, 0, 0, 0);

          const bookings = await Booking.find({
            'equipment.equipmentId': equip._id,
            date: bookingDate,
            status: 'confirmed',
            $or: [
              {
                $and: [
                  { startTime: { $lt: endTime } },
                  { endTime: { $gt: startTime } },
                ],
              },
            ],
          });

          let usedQuantity = 0;
          for (const booking of bookings) {
            const equipmentItem = booking.equipment.find(
              (e) => e.equipmentId.toString() === equip._id.toString()
            );
            if (equipmentItem) {
              usedQuantity += equipmentItem.quantity;
            }
          }

          const availableQuantity = equip.totalQuantity - usedQuantity;
          if (availableQuantity > 0) {
            availableEquipment.push({
              ...equip.toObject(),
              availableQuantity,
            });
          }
        }
      }

      // Get all active coaches and check availability
      const allCoaches = await Coach.find({ status: 'active' });
      const availableCoaches = [];

      for (const coach of allCoaches) {
        if (!startTime) {
          availableCoaches.push(coach);
        } else {
          const isAvailable = await bookingService.isCoachAvailable(
            coach._id,
            date,
            startTime,
            endTime
          );
          if (isAvailable) {
            availableCoaches.push(coach);
          }
        }
      }

      console.log(`Available resources for ${date} ${startTime || 'all day'}:`);
      console.log(`Courts: ${availableCourts.length}/${allCourts.length}`);
      console.log(`Equipment: ${availableEquipment.length}/${allEquipment.length}`);
      console.log(`Coaches: ${availableCoaches.length}/${allCoaches.length}`);

      res.json({
        success: true,
        data: {
          courts: availableCourts,
          equipment: availableEquipment,
          coaches: availableCoaches,
        },
      });
    } catch (error) {
      console.error('Get available resources error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = availabilityController;
