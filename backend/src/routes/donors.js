// routes/donors.js
const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const validate = require('../middleware/validate');
const { updateProfile, listDonors } = require('../controllers/donors');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// PUT /api/donors/me – donor updates profile
router.put(
  '/me',
  auth,
  requireRole('donor'),
  [
    body('phone').optional().trim(),
    body('city').optional().trim(),
    body('bloodGroup').optional().isIn(BLOOD_GROUPS).withMessage('Invalid blood group'),
    body('isAvailable').optional().isBoolean(),
  ],
  validate,
  updateProfile
);

// GET /api/donors – hospital or admin searches donors
router.get('/', auth, requireRole('hospital', 'admin'), listDonors);

module.exports = router;
