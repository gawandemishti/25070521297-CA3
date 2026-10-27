const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    message: {
      type: String,
      maxlength: [200, 'Message cannot exceed 200 characters'],
      default: 'Hi! Let us connect on CampusConnect.',
    },
  },
  {
    timestamps: true,
  }
);

connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);

