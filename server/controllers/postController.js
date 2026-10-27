const Post = require('../models/Post');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @route   GET /api/posts
 * @desc    Get collaboration & community posts with search and skill filter
 * @access  Public
 */
const getPosts = async (req, res, next) => {
  try {
    const { skill, type, college, page = 1, limit = 10 } = req.query;

    const query = {};

    if (skill) {
      query.requiredSkills = { $regex: skill, $options: 'i' };
    }

    if (type) {
      query.type = type;
    }

    if (college) {
      query.college = college;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name email department year skills interests profileImage')
        .populate('college', 'name city state logo')
        .populate('relatedEvent', 'title startDate bannerImage')
        .populate('comments.user', 'name profileImage department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Post.countDocuments(query),
    ]);

    return sendSuccess(
      res,
      200,
      'Posts retrieved successfully',
      { posts },
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/posts
 * @desc    Create a project collaboration post
 * @access  Private
 */
const createPost = async (req, res, next) => {
  try {
    const { title, content, type, requiredSkills, relatedEvent } = req.body;

    if (!title || !content) {
      return sendError(res, 400, 'Please provide both title and content for your post.');
    }

    const parsedSkills = Array.isArray(requiredSkills)
      ? requiredSkills
      : typeof requiredSkills === 'string' && requiredSkills.trim()
      ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const post = await Post.create({
      author: req.user._id,
      college: req.user.college,
      title: title.trim(),
      content,
      type: type || 'collaboration',
      requiredSkills: parsedSkills,
      relatedEvent: relatedEvent || null,
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name department year skills profileImage')
      .populate('college', 'name city state logo');

    return sendSuccess(res, 201, 'Post published successfully!', { post: populatedPost });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/posts/:id/comments
 * @desc    Comment on a collaboration post
 * @access  Private
 */
const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return sendError(res, 400, 'Comment text is required.');
    }

    const post = await Post.findById(id);
    if (!post) {
      return sendError(res, 404, 'Post not found.');
    }

    post.comments.push({
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
    });

    await post.save();

    const updatedPost = await Post.findById(id)
      .populate('author', 'name department year profileImage')
      .populate('comments.user', 'name profileImage department');

    return sendSuccess(res, 201, 'Comment added', { post: updatedPost });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete post
 * @access  Private
 */
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return sendError(res, 404, 'Post not found.');
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'platform_admin') {
      return sendError(res, 403, 'Forbidden: You cannot delete another user post.');
    }

    await Post.findByIdAndDelete(id);
    return sendSuccess(res, 200, 'Post deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  createPost,
  addComment,
  deletePost,
};

