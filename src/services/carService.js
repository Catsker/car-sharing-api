const Car = require('../models/Car');

async function getAllCars() {
  return Car.find();
}

async function getInUseLowFuelCars() {
  return Car.find({ status: 'In use', fuelLevel: { $lt: 0.25 } });
}

async function getReservedUnauthorizedCars() {
  const cars = await Car.find({
    status: 'Reserved',
    'currentRun.driver.creditCard.isAuthorized': false,
  });

  return cars.map((car) => ({
    VIN: car.VIN,
    location: car.location,
    driver: {
      firstName: car.currentRun.driver.firstName,
      lastName: car.currentRun.driver.lastName,
      licenseNumber: car.currentRun.driver.licenseNumber,
    },
  }));
}

async function createCar(carData) {
  return Car.create(carData);
}

async function sendOldOrHighMileageCarsToService() {
  const result = await Car.updateMany(
    {
      $or: [{ 'productionInfo.date': { $lt: new Date('2017-01-01') } }, { mileage: { $gt: 100000 } }],
    },
    { $set: { status: 'In Service' } }
  );

  return { matched: result.matchedCount, modified: result.modifiedCount };
}

async function relocatePopularCars() {
  const result = await Car.updateMany(
    {
      $expr: { $gt: [{ $size: '$bookingsHistory' }, 2] },
      status: { $nin: ['In use', 'Reserved'] },
    },
    {
      $set: {
        'location.type': 'Point',
        'location.coordinates': [27.5442615, 53.8882836],
      },
    }
  );

  return { matched: result.matchedCount, modified: result.modifiedCount };
}

async function getCarByVin(vin) {
  return Car.findOne({ VIN: vin });
}

async function deleteCarByVin(vin) {
  return Car.findOneAndDelete({ VIN: vin });
}

module.exports = {
  getAllCars,
  getInUseLowFuelCars,
  getReservedUnauthorizedCars,
  createCar,
  sendOldOrHighMileageCarsToService,
  relocatePopularCars,
  getCarByVin,
  deleteCarByVin,
};
