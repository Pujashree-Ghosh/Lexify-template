const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    providerId: {
      type: String,
      required: true,
      trim: true,
    },
    customerId: {
      type: String,
      required: true,
      trim: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model('booking-detail', BookingSchema);
module.exports.Booking = Booking;
