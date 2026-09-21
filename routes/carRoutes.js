const express = require('express');
const Car = require('../models/Car');

const router = express.Router();

// GET /api/cars/in-use-low-fuel
router.get('/in-use-low-fuel', async (req, res) => {
  try {
    const cars = await Car.find({ status: 'In use', fuelLevel: { $lt: 0.25 } });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cars/reserved-unauthorized
router.get('/reserved-unauthorized', async (req, res) => {
  try {
    const cars = await Car.find({
      status: 'Reserved',
      'currentRun.driver.creditCard.isAuthorized': false,
    });

    const result = cars.map((car) => ({
      VIN: car.VIN,
      location: car.location,
      driver: {
        firstName: car.currentRun.driver.firstName,
        lastName: car.currentRun.driver.lastName,
        licenseNumber: car.currentRun.driver.licenseNumber,
      },
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cars
router.post('/', async (req, res) => {
  try {
    const car = await Car.create(req.body);
    res.status(201).json(car);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/cars/service-update
router.put('/service-update', async (req, res) => {
  try {
    const result = await Car.updateMany(
      {
        $or: [{ 'productionInfo.date': { $lt: new Date('2017-01-01') } }, { mileage: { $gt: 100000 } }],
      },
      { $set: { status: 'In Service' } }
    );

    res.json({ matched: result.matchedCount, modified: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cars/relocate-popular
router.put('/relocate-popular', async (req, res) => {
  try {
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

    res.json({ matched: result.matchedCount, modified: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cars/:vin
router.delete('/:vin', async (req, res) => {
  try {
    const car = await Car.findOneAndDelete({ VIN: req.params.vin });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json({ message: 'Car deleted', car });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
