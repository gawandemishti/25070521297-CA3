const express = require('express');
const router = express.Router();
const collegeController = require('../controllers/collegeController');
const { authenticate } = require('../middleware/auth');

router.get('/', collegeController.getColleges);
router.get('/:id', collegeController.getCollegeById);
router.get('/:id/events', collegeController.getCollegeEvents);
router.get('/:id/clubs', collegeController.getCollegeClubs);
router.post('/', authenticate, collegeController.createCollege);
router.patch('/:id', authenticate, collegeController.updateCollege);

module.exports = router;

