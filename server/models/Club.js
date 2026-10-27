const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Club name is required'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Club description is required'],
    },
    category: {
      type: String,
      required: [true, 'Club category is required'],
      enum: [
        'Coding & Development',
        'Artificial Intelligence & Data',
        'Robotics & IoT',
        'Entrepreneurship & E-Cell',
        'Cultural & Performing Arts',
        'Photography & Media',
        'Music & Sound',
        'Dance & Choreography',
        'Sports & Fitness',
        'Social Service & NSS',
        'Design & UI/UX',
        'Literary & Debating',
        'Other',
      ],
      default: 'Coding & Development',
    },
    logo: {
      type: String,
      default: '',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'Associated college is required'],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Club organizer / lead is required'],
    },
    membershipPolicy: {
      type: String,
      default: 'Open to eligible college students with passion to learn.',
    },
    externalMembershipAllowed: {
      type: Boolean,
      default: true, // Multi-college cross participation!
    },
    status: {
      type: String,
      enum: ['pending_approval', 'active', 'inactive', 'rejected'],
      default: 'active',
    },
    activities: {
      type: [String],
      default: [],
    },
    achievements: {
      type: [String],
      default: [],
    },
    announcements: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

clubSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Club', clubSchema);

