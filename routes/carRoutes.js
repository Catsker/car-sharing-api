const express = require('express');
const Car = require('../models/Car');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cars
 *   description: Car sharing fleet management
 */

/**
 * @swagger
 * /api/cars:
 *   get:
 *     summary: Get all cars
 *     description: Returns the full list of cars in the fleet
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: List of all cars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Car'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/cars/in-use-low-fuel:
 *   get:
 *     summary: Get cars in use with low fuel level
 *     description: Returns cars with status 'In use' and fuelLevel < 0.25
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: List of matching cars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Car'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/in-use-low-fuel', async (req, res) => {
  try {
    const cars = await Car.find({ status: 'In use', fuelLevel: { $lt: 0.25 } });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/cars/reserved-unauthorized:
 *   get:
 *     summary: Get reserved cars with unauthorized credit card
 *     description: Returns cars with status 'Reserved' where currentRun.driver.creditCard.isAuthorized is false. Only VIN, location and driver firstName/lastName/licenseNumber are returned.
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: List of matching cars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReservedUnauthorizedCar'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Add a new car
 *     tags: [Cars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       201:
 *         description: Car created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', async (req, res) => {
  try {
    const car = await Car.create(req.body);
    res.status(201).json(car);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/cars/service-update:
 *   put:
 *     summary: Send old/high-mileage cars to service
 *     description: Sets status to 'In Service' for cars produced before 2017-01-01 or with mileage > 100000
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: Update result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateManyResult'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/cars/relocate-popular:
 *   put:
 *     summary: Relocate popular cars to a fixed location
 *     description: Updates location coordinates to [27.5442615, 53.8882836] for cars with bookingsHistory.length > 2 and status not 'In use' and not 'Reserved'
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: Update result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateManyResult'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/cars/{vin}:
 *   get:
 *     summary: Get a car by VIN
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: vin
 *         required: true
 *         schema:
 *           type: string
 *         description: VIN of the car to retrieve
 *     responses:
 *       200:
 *         description: Car found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       404:
 *         description: Car not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:vin', async (req, res) => {
  try {
    const car = await Car.findOne({ VIN: req.params.vin });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/cars/{vin}:
 *   delete:
 *     summary: Delete a car by VIN
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: vin
 *         required: true
 *         schema:
 *           type: string
 *         description: VIN of the car to delete
 *     responses:
 *       200:
 *         description: Car deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 car:
 *                   $ref: '#/components/schemas/Car'
 *       404:
 *         description: Car not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
