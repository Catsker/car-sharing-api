const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Car Sharing API',
      version: '1.0.0',
      description: 'API for managing a car-sharing fleet',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      schemas: {
        CreditCard: {
          type: 'object',
          properties: {
            number: { type: 'string' },
            owner: { type: 'string' },
            validThrough: { type: 'string' },
            isAuthorized: { type: 'boolean' },
          },
        },
        Driver: {
          type: 'object',
          properties: {
            licenseNumber: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            creditCard: { $ref: '#/components/schemas/CreditCard' },
          },
        },
        Run: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date-time' },
            driver: { $ref: '#/components/schemas/Driver' },
            startFuelLevel: { type: 'number' },
            startMileage: { type: 'number' },
          },
        },
        BookingHistoryItem: {
          allOf: [
            { $ref: '#/components/schemas/Run' },
            {
              type: 'object',
              properties: {
                finishFuelLevel: { type: 'number' },
                finishMileage: { type: 'number' },
              },
            },
          ],
        },
        Location: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['Point'] },
            coordinates: {
              type: 'array',
              items: { type: 'number' },
              example: [27.5615, 53.9006],
            },
          },
        },
        Car: {
          type: 'object',
          properties: {
            VIN: { type: 'string', example: 'VIN00000000000001' },
            registrationNumber: { type: 'string', example: 'AB1111BB' },
            productionInfo: {
              type: 'object',
              properties: {
                brand: { type: 'string', example: 'Toyota' },
                model: { type: 'string', example: 'Corolla' },
                date: { type: 'string', format: 'date', example: '2021-03-15' },
              },
            },
            status: {
              type: 'string',
              enum: ['Free', 'Reserved', 'In use', 'Unavailable', 'In Service'],
              example: 'Free',
            },
            fuelLevel: { type: 'number', example: 0.75 },
            mileage: { type: 'number', example: 15200 },
            currentRun: {
              nullable: true,
              allOf: [{ $ref: '#/components/schemas/Run' }],
            },
            location: { $ref: '#/components/schemas/Location' },
            bookingsHistory: {
              type: 'array',
              items: { $ref: '#/components/schemas/BookingHistoryItem' },
            },
          },
        },
        ReservedUnauthorizedCar: {
          type: 'object',
          properties: {
            VIN: { type: 'string' },
            location: { $ref: '#/components/schemas/Location' },
            driver: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                licenseNumber: { type: 'string' },
              },
            },
          },
        },
        UpdateManyResult: {
          type: 'object',
          properties: {
            matched: { type: 'integer' },
            modified: { type: 'integer' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: [`${__dirname}/routes/*.js`],
};

module.exports = swaggerJsdoc(options);
