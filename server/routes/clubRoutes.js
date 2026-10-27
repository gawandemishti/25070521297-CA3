const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', clubController.getClubs);
router.get('/:id', optionalAuthenticate, clubController.getClubById);
router.post(
  '/',
  authenticate,
  authorize('organizer', 'college_admin', 'platform_admin'),
  clubController.createClub
);

router.post('/:id/membership-requests', authenticate, clubController.requestClubMembership);
router.get('/:id/membership-requests', authenticate, clubController.getClubMembershipRequests);
router.patch(
  '/:id/membership-requests/:requestId',
  authenticate,
  clubController.reviewClubMembershipRequest
);

module.exports = router;

