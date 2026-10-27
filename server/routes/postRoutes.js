const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate } = require('../middleware/auth');

router.get('/', postController.getPosts);
router.post('/', authenticate, postController.createPost);
router.post('/:id/comments', authenticate, postController.addComment);
router.delete('/:id', authenticate, postController.deletePost);

module.exports = router;

