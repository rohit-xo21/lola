const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    description: String,
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: '📁' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('List', ListSchema);
