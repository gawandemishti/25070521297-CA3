const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// Platform admin only routes
router.get(
  '/colleges/pending',
  authenticate,
  authorize('platform_admin'),
  adminController.getPendingColleges
);
router.patch(
  '/colleges/:id/verification',
  authenticate,
  authorize('platform_admin'),
  adminController.updateCollegeVerification
);
router.get('/users', authenticate, authorize('platform_admin'), adminController.getAllUsers);
router.patch(
  '/users/:id/status',
  authenticate,
  authorize('platform_admin'),
  adminController.updateUserStatus
);
router.get('/reports', authenticate, authorize('platform_admin'), adminController.getReports);
router.patch(
  '/reports/:id',
  authenticate,
  authorize('platform_admin'),
  adminController.resolveReport
);

// Any authenticated user can submit a report
router.post('/reports', authenticate, adminController.submitReport);

module.exports = router;

