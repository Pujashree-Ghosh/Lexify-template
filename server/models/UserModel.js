const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      //   unique: true,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isActive: Boolean,
    otp: {
      type: Number,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('users', UserSchema);
module.exports.User = User;
