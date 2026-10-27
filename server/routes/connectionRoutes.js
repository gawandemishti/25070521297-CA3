const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const { authenticate } = require('../middleware/auth');

router.post('/:userId', authenticate, connectionController.sendConnectionRequest);
router.get('/requests', authenticate, connectionController.getConnectionRequests);
router.patch('/:id', authenticate, connectionController.respondToConnectionRequest);

module.exports = router;

