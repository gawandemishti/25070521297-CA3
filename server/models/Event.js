const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Event title must be at least 3 characters'],
      maxlength: [150, 'Event title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Hackathon',
        'Coding Competition',
        'Workshop & Bootcamp',
        'Cultural Fest',
        'Technical Symposium',
        'Seminar & Guest Lecture',
        'Robotics & Gaming',
        'Sports & Athletics',
        'Paper & Project Expo',
        'Conference',
        'Other',
      ],
      default: 'Hackathon',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer is required'],
    },
    organizingCollege: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'Organizing college is required'],
    },
    organizingClub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required'],
    },
    venue: {
      type: String,
      required: [true, 'Venue or platform URL is required'],
      trim: true,
    },
    deliveryMode: {
      type: String,
      enum: ['offline', 'online', 'hybrid'],
      default: 'offline',
    },
    city: {
      type: String,
      default: '',
    },
    eligibility: {
      type: String,
      default: 'Open to enrolled college students with valid student ID.',
    },
    participationScope: {
      type: String,
      enum: ['all', 'selected_colleges', 'own_college_only'],
      default: 'all',
    },
    allowedColleges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
      },
    ],
    capacity: {
      type: Number,
      default: 100,
      min: [1, 'Capacity must be at least 1'],
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    fee: {
      type: Number,
      default: 0,
      min: [0, 'Fee cannot be negative'],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'published',
    },
    isTeamEvent: {
      type: Boolean,
      default: false,
    },
    minTeamSize: {
      type: Number,
      default: 1,
    },
    maxTeamSize: {
      type: Number,
      default: 4,
    },
    tags: {
      type: [String],
      default: [],
    },
    prizes: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      default: '',
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

eventSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-') +
      '-' +
      Math.random().toString(36).substring(2, 7);
  }
  next();
});

// Indexes for searching & filtering
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ organizingCollege: 1, category: 1, status: 1 });

module.exports = mongoose.model('Event', eventSchema);

