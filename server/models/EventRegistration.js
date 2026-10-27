const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    registrationStatus: {
      type: String,
      enum: ['confirmed', 'waitlist', 'cancelled', 'attended'],
      default: 'confirmed',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    ticketCode: {
      type: String,
      unique: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    attendanceStatus: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee one registration per student per event
eventRegistrationSchema.index({ event: 1, student: 1 }, { unique: true });

eventRegistrationSchema.pre('save', function (next) {
  if (!this.ticketCode) {
    this.ticketCode = 'CC-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4);
  }
  next();
});

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);

