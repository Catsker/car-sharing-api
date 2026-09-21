const mongoose = require('mongoose');
const Car = require('./models/Car');

const MONGO_URI = 'mongodb://localhost:27017/car-sharing';

const makeDriver = (licenseNumber, firstName, lastName, isAuthorized) => ({
  licenseNumber,
  firstName,
  lastName,
  creditCard: {
    number: '4111111111111111',
    owner: `${firstName} ${lastName}`,
    validThrough: '12/28',
    isAuthorized,
  },
});

const cars = [
  // 1. In use, fuelLevel < 0.25
  {
    VIN: 'VIN00000000000001',
    registrationNumber: 'AB1111BB',
    productionInfo: { brand: 'Toyota', model: 'Corolla', date: new Date('2021-03-15') },
    status: 'In use',
    fuelLevel: 0.12,
    mileage: 34500,
    currentRun: {
      startDate: new Date('2026-09-20T10:00:00Z'),
      driver: makeDriver('LIC-1001', 'Ivan', 'Petrov', true),
      startFuelLevel: 0.3,
      startMileage: 34300,
    },
    location: { type: 'Point', coordinates: [27.5615, 53.9006] },
    bookingsHistory: [],
  },

  // 2. Reserved, unauthorized card
  {
    VIN: 'VIN00000000000002',
    registrationNumber: 'AB2222BB',
    productionInfo: { brand: 'Volkswagen', model: 'Golf', date: new Date('2020-06-01') },
    status: 'Reserved',
    fuelLevel: 0.6,
    mileage: 21000,
    currentRun: {
      startDate: new Date('2026-09-21T08:00:00Z'),
      driver: makeDriver('LIC-1002', 'Anna', 'Sidorova', false),
      startFuelLevel: 0.6,
      startMileage: 21000,
    },
    location: { type: 'Point', coordinates: [27.5590, 53.9020] },
    bookingsHistory: [],
  },

  // 3. Old production date / high mileage
  {
    VIN: 'VIN00000000000003',
    registrationNumber: 'AB3333BB',
    productionInfo: { brand: 'Skoda', model: 'Octavia', date: new Date('2015-05-20') },
    status: 'Free',
    fuelLevel: 0.85,
    mileage: 152000,
    currentRun: null,
    location: { type: 'Point', coordinates: [27.5700, 53.9100] },
    bookingsHistory: [],
  },

  // 4. Free, bookingsHistory > 2
  {
    VIN: 'VIN00000000000004',
    registrationNumber: 'AB4444BB',
    productionInfo: { brand: 'Hyundai', model: 'Solaris', date: new Date('2022-01-10') },
    status: 'Free',
    fuelLevel: 0.75,
    mileage: 15200,
    currentRun: null,
    location: { type: 'Point', coordinates: [27.5555, 53.9111] },
    bookingsHistory: [
      {
        startDate: new Date('2026-07-01T09:00:00Z'),
        driver: makeDriver('LIC-2001', 'Sergey', 'Ivanov', true),
        startFuelLevel: 0.9,
        startMileage: 14000,
        finishFuelLevel: 0.5,
        finishMileage: 14300,
      },
      {
        startDate: new Date('2026-07-15T09:00:00Z'),
        driver: makeDriver('LIC-2002', 'Olga', 'Kuznetsova', true),
        startFuelLevel: 0.8,
        startMileage: 14300,
        finishFuelLevel: 0.4,
        finishMileage: 14700,
      },
      {
        startDate: new Date('2026-08-01T09:00:00Z'),
        driver: makeDriver('LIC-2003', 'Dmitry', 'Volkov', false),
        startFuelLevel: 0.7,
        startMileage: 14700,
        finishFuelLevel: 0.3,
        finishMileage: 15200,
      },
    ],
  },

  // 5. Plain additional car for variety
  {
    VIN: 'VIN00000000000005',
    registrationNumber: 'AB5555BB',
    productionInfo: { brand: 'BMW', model: '320i', date: new Date('2023-11-05') },
    status: 'In Service',
    fuelLevel: 0.5,
    mileage: 8000,
    currentRun: null,
    location: { type: 'Point', coordinates: [27.5480, 53.8950] },
    bookingsHistory: [],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await Car.deleteMany({});
    console.log('Cleared cars collection');

    await Car.insertMany(cars);
    console.log(`Inserted ${cars.length} cars`);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
