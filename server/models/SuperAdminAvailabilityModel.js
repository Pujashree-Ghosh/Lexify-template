const mongoose = require('mongoose');

const SuperAdminAvailabilitySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    entries: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

const AdminAvailability = mongoose.model('admin-availability', SuperAdminAvailabilitySchema);
module.exports.AdminAvailability = AdminAvailability;
