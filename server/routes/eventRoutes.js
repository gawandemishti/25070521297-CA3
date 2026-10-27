const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const registrationController = require('../controllers/registrationController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', eventController.getEvents);
router.get('/:id', optionalAuthenticate, eventController.getEventById);
router.post(
  '/',
  authenticate,
  authorize('organizer', 'college_admin', 'platform_admin'),
  eventController.createEvent
);
router.patch('/:id', authenticate, eventController.updateEvent);
router.delete('/:id', authenticate, eventController.deleteEvent);
router.get('/:id/registrations', authenticate, eventController.getEventRegistrations);

// Direct registration route: POST /api/events/:id/register
router.post('/:id/register', authenticate, registrationController.registerForEvent);

module.exports = router;

