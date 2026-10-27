const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, teamController.createTeam);
router.get('/', authenticate, teamController.getTeams);
router.get('/:id', authenticate, teamController.getTeamById);
router.post('/:id/invitations', authenticate, teamController.inviteMember);
router.patch('/:id/invitations/:invitationId', authenticate, teamController.respondToInvitation);

module.exports = router;

