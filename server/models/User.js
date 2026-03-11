const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, sparse: true },
    passwordHash: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    displayName: String,
    avatar: String,
    settings: {
      groqApiKey: { type: String, default: '' },
      groqModel: { type: String, default: 'llama-3.3-70b-versatile' },
      ollamaBaseUrl: { type: String, default: '' },
      ollamaModel: { type: String, default: '' },
      preferredView: { type: String, default: 'grid' },
    },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 12);
};

module.exports = mongoose.model('User', UserSchema);
