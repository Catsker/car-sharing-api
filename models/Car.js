const mongoose = require('mongoose');

const { Schema } = mongoose;

const creditCardSchema = new Schema(
  {
    number: { type: String, required: true },
    owner: { type: String, required: true },
    validThrough: { type: String, required: true },
    isAuthorized: { type: Boolean, required: true },
  },
  { _id: false }
);

const driverSchema = new Schema(
  {
    licenseNumber: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    creditCard: { type: creditCardSchema, required: true },
  },
  { _id: false }
);

const runSchema = new Schema(
  {
    startDate: { type: Date, required: true },
    driver: { type: driverSchema, required: true },
    startFuelLevel: { type: Number, required: true },
    startMileage: { type: Number, required: true },
  },
  { _id: false }
);

const bookingHistorySchema = new Schema(
  {
    startDate: { type: Date, required: true },
    driver: { type: driverSchema, required: true },
    startFuelLevel: { type: Number, required: true },
    startMileage: { type: Number, required: true },
    finishFuelLevel: { type: Number, required: true },
    finishMileage: { type: Number, required: true },
  },
  { _id: false }
);

const locationSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  { _id: false }
);

const carSchema = new Schema(
  {
    VIN: { type: String, required: true, unique: true },
    registrationNumber: { type: String },
    productionInfo: {
      brand: { type: String, required: true },
      model: { type: String, required: true },
      date: { type: Date, required: true },
    },
    status: {
      type: String,
      enum: ['Free', 'Reserved', 'In use', 'Unavailable', 'In Service'],
      default: 'Free',
    },
    fuelLevel: { type: Number, required: true },
    mileage: { type: Number, required: true },
    currentRun: { type: runSchema, default: null },
    location: { type: locationSchema, required: true },
    bookingsHistory: { type: [bookingHistorySchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Car', carSchema);
