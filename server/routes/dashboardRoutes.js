const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/student', authenticate, dashboardController.getStudentDashboard);
router.get(
  '/organizer',
  authenticate,
  authorize('organizer', 'college_admin', 'platform_admin'),
  dashboardController.getOrganizerDashboard
);
router.get(
  '/college-admin',
  authenticate,
  authorize('college_admin', 'platform_admin'),
  dashboardController.getCollegeAdminDashboard
);
router.get(
  '/platform-admin',
  authenticate,
  authorize('platform_admin'),
  dashboardController.getPlatformAdminDashboard
);

module.exports = router;

