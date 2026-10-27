const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      maxlength: [60, 'Team name cannot exceed 60 characters'],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        roleInTeam: {
          type: String,
          default: 'Member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    maxMembers: {
      type: Number,
      default: 4,
    },
    status: {
      type: String,
      enum: ['forming', 'registered', 'disbanded'],
      default: 'forming',
    },
    inviteCode: {
      type: String,
      unique: true,
    },
    projectIdea: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

teamSchema.pre('save', function (next) {
  if (!this.inviteCode) {
    this.inviteCode = 'TEAM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Team', teamSchema);

