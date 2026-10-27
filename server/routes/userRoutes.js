const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, userController.updateMe);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);

module.exports = router;

