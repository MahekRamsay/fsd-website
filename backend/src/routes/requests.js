// routes/requests.js – blood request CRUD and donor responses
const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const validate = require('../middleware/validate');
const {
  createRequest, listRequests, getRequest,
  updateStatus, deleteRequest, respondToRequest, getResponses,
} = require('../controllers/requests');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

router.post(
  '/',
  auth,
  requireRole('hospital'),
  [
    body('bloodGroup').isIn(BLOOD_GROUPS).withMessage('Invalid blood group'),
    body('units').isInt({ min: 1, max: 20 }).withMessage('Units must be 1–20'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('urgency').isIn(['normal', 'urgent', 'critical']).withMessage('Invalid urgency'),
  ],
  validate,
  createRequest
);

router.get('/', auth, listRequests);
router.get('/:id', auth, getRequest);

router.patch(
  '/:id/status',
  auth,
  requireRole('hospital', 'admin'),
  [body('status').isIn(['open', 'fulfilled', 'closed']).withMessage('Invalid status')],
  validate,
  updateStatus
);

router.delete('/:id', auth, requireRole('hospital', 'admin'), deleteRequest);

// Donor responds to a request
router.post('/:id/respond', auth, requireRole('donor'), respondToRequest);

// Hospital/admin sees who responded
router.get('/:id/responses', auth, requireRole('hospital', 'admin'), getResponses);

module.exports = router;
