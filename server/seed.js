const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Court = require('./models/Court');
const Equipment = require('./models/Equipment');
const Coach = require('./models/Coach');
const PricingRule = require('./models/PricingRule');
const User = require('./models/User');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/badminton-booking');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Court.deleteMany({});
    await Equipment.deleteMany({});
    await Coach.deleteMany({});
    await PricingRule.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Seed Courts
    const courts = await Court.create([
      {
        name: 'Indoor Court 1',
        type: 'indoor',
        baseRate: 500,
        status: 'active',
        description: 'Premium indoor court with AC',
      },
      {
        name: 'Indoor Court 2',
        type: 'indoor',
        baseRate: 500,
        status: 'active',
        description: 'Premium indoor court with AC',
      },
      {
        name: 'Outdoor Court 1',
        type: 'outdoor',
        baseRate: 300,
        status: 'active',
        description: 'Standard outdoor court',
      },
      {
        name: 'Outdoor Court 2',
        type: 'outdoor',
        baseRate: 300,
        status: 'active',
        description: 'Standard outdoor court',
      },
    ]);
    console.log('Seeded courts:', courts.length);

    // Seed Equipment
    const equipment = await Equipment.create([
      {
        name: 'Professional Racket',
        type: 'racket',
        totalQuantity: 10,
        rate: 50,
        status: 'available',
        description: 'High-quality carbon fiber racket',
      },
      {
        name: 'Beginner Racket',
        type: 'racket',
        totalQuantity: 15,
        rate: 30,
        status: 'available',
        description: 'Suitable for beginners',
      },
      {
        name: 'Badminton Shoes (Size 8-10)',
        type: 'shoes',
        totalQuantity: 8,
        rate: 40,
        status: 'available',
        description: 'Non-marking sole',
      },
      {
        name: 'Shuttlecocks (Set of 6)',
        type: 'shuttlecock',
        totalQuantity: 20,
        rate: 20,
        status: 'available',
        description: 'Feather shuttlecocks',
      },
    ]);
    console.log('Seeded equipment:', equipment.length);

    // Seed Coaches
    const coaches = await Coach.create([
      {
        name: 'John Smith',
        email: 'john.smith@coaching.com',
        phone: '+1-555-0101',
        specialization: ['beginner', 'intermediate'],
        hourlyRate: 200,
        availability: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
          { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Friday
        ],
        status: 'active',
        bio: 'Certified badminton coach with 5 years of experience',
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@coaching.com',
        phone: '+1-555-0102',
        specialization: ['intermediate', 'advanced'],
        hourlyRate: 300,
        availability: [
          { dayOfWeek: 1, startTime: '14:00', endTime: '21:00' },
          { dayOfWeek: 2, startTime: '14:00', endTime: '21:00' },
          { dayOfWeek: 3, startTime: '14:00', endTime: '21:00' },
          { dayOfWeek: 5, startTime: '14:00', endTime: '21:00' },
          { dayOfWeek: 6, startTime: '09:00', endTime: '18:00' }, // Saturday
        ],
        status: 'active',
        bio: 'Former national player, specializes in advanced techniques',
      },
      {
        name: 'Mike Chen',
        email: 'mike.chen@coaching.com',
        phone: '+1-555-0103',
        specialization: ['beginner', 'intermediate', 'advanced'],
        hourlyRate: 250,
        availability: [
          { dayOfWeek: 0, startTime: '08:00', endTime: '16:00' }, // Sunday
          { dayOfWeek: 3, startTime: '17:00', endTime: '21:00' },
          { dayOfWeek: 4, startTime: '17:00', endTime: '21:00' },
          { dayOfWeek: 6, startTime: '08:00', endTime: '16:00' }, // Saturday
        ],
        status: 'active',
        bio: 'All-level coach specializing in doubles strategy',
      },
    ]);
    console.log('Seeded coaches:', coaches.length);

    // Seed Pricing Rules
    const pricingRules = await PricingRule.create([
      {
        name: 'Peak Hours Premium',
        description: '50% extra charge during peak hours (6 PM - 9 PM)',
        ruleType: 'multiplier',
        value: 1.5,
        conditions: {
          isPeakHour: true,
          peakHourStart: '18:00',
          peakHourEnd: '21:00',
          courtType: 'any',
        },
        priority: 10,
        isActive: true,
      },
      {
        name: 'Weekend Premium',
        description: '30% extra charge on weekends',
        ruleType: 'multiplier',
        value: 1.3,
        conditions: {
          isWeekend: true,
          courtType: 'any',
        },
        priority: 5,
        isActive: true,
      },
      {
        name: 'Indoor Court Premium',
        description: '₹200 extra for indoor courts',
        ruleType: 'addition',
        value: 200,
        conditions: {
          courtType: 'indoor',
        },
        priority: 1,
        isActive: true,
      },
    ]);
    console.log('Seeded pricing rules:', pricingRules.length);

    // Seed Users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@badminton.com',
        password: 'admin123',
        phone: '+1-555-0001',
        role: 'admin',
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'user123',
        phone: '+1-555-1001',
        role: 'user',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'user123',
        phone: '+1-555-1002',
        role: 'user',
      },
    ]);
    console.log('Seeded users:', users.length);
    console.log('\n📧 Login Credentials:');
    console.log('Admin: admin@badminton.com / admin123');
    console.log('User1: john@example.com / user123');
    console.log('User2: jane@example.com / user123');

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
