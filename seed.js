const mongoose = require('mongoose');
require('dotenv').config();
const Car = require('./models/Car');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/car-sharing';

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

// --- Random generation helpers for additional cars ---

const BRANDS = {
  BMW: ['320i', 'X1', 'X3', '520d'],
  Audi: ['A3', 'A4', 'Q3', 'Q5'],
  Mercedes: ['A-Class', 'C-Class', 'GLA', 'CLA'],
  Kia: ['Rio', 'Ceed', 'Sportage', 'Sorento'],
  Hyundai: ['Solaris', 'Elantra', 'Tucson', 'Creta'],
  Toyota: ['Corolla', 'Camry', 'RAV4', 'Yaris'],
  Volkswagen: ['Golf', 'Polo', 'Tiguan', 'Passat'],
  Skoda: ['Octavia', 'Rapid', 'Kodiaq', 'Fabia'],
};

const STATUSES = ['Free', 'Reserved', 'In use', 'Unavailable', 'In Service'];
const FIRST_NAMES = ['Alexey', 'Maria', 'Pavel', 'Ekaterina', 'Nikita', 'Yulia', 'Denis', 'Victoria', 'Igor', 'Elena'];
const LAST_NAMES = ['Kozlov', 'Novikova', 'Sokolov', 'Fedorova', 'Morozov', 'Belova', 'Orlov', 'Zaitseva', 'Popov', 'Vasilieva'];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => Number((Math.random() * (max - min) + min).toFixed(decimals));
const randomItem = (arr) => arr[randomInt(0, arr.length - 1)];
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const randomVIN = () =>
  `VIN${Array.from({ length: 14 }, () => randomInt(0, 9)).join('')}`;

const randomCoordinates = () => [
  randomFloat(27.4, 27.7, 4),
  randomFloat(53.8, 54.0, 4),
];

const randomDriver = () => {
  const firstName = randomItem(FIRST_NAMES);
  const lastName = randomItem(LAST_NAMES);
  return makeDriver(`LIC-${randomInt(3000, 9999)}`, firstName, lastName, Math.random() > 0.3);
};

const randomBookingHistoryItem = () => {
  const startMileage = randomInt(1000, 150000);
  const startFuelLevel = randomFloat(0.3, 1);
  return {
    startDate: randomDate(new Date('2026-01-01'), new Date('2026-09-01')),
    driver: randomDriver(),
    startFuelLevel,
    startMileage,
    finishFuelLevel: randomFloat(0.05, startFuelLevel),
    finishMileage: startMileage + randomInt(50, 500),
  };
};

const generateRandomCar = (index) => {
  const brand = randomItem(Object.keys(BRANDS));
  const model = randomItem(BRANDS[brand]);
  const status = randomItem(STATUSES);
  const mileage = randomInt(1000, 180000);
  const fuelLevel = randomFloat(0.02, 1);
  const bookingsHistory = Array.from({ length: randomInt(0, 4) }, randomBookingHistoryItem);
  const hasCurrentRun = status === 'In use' || status === 'Reserved' || Math.random() > 0.7;

  return {
    VIN: randomVIN(),
    registrationNumber: `AB${randomInt(1000, 9999)}BB`,
    productionInfo: {
      brand,
      model,
      date: randomDate(new Date('2012-01-01'), new Date('2025-12-31')),
    },
    status,
    fuelLevel,
    mileage,
    currentRun: hasCurrentRun
      ? {
          startDate: randomDate(new Date('2026-08-01'), new Date('2026-09-21')),
          driver: randomDriver(),
          startFuelLevel: randomFloat(0.3, 1),
          startMileage: mileage,
        }
      : null,
    location: { type: 'Point', coordinates: randomCoordinates() },
    bookingsHistory,
  };
};

const additionalCars = Array.from({ length: 25 }, (_, i) => generateRandomCar(i + 6));

const allCars = [...cars, ...additionalCars];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await Car.deleteMany({});
    console.log('Cleared cars collection');

    await Car.insertMany(allCars);
    console.log(`Inserted ${allCars.length} cars`);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
