const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    displayName: String,
    avatar: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
