const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: [1000, 'Content cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: ['collaboration', 'general', 'achievement', 'question'],
      default: 'collaboration',
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    relatedEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: [300, 'Comment cannot exceed 300 characters'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

postSchema.index({ requiredSkills: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);

