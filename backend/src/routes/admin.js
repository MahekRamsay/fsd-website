// routes/admin.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const { getStats, listUsers, deleteUser } = require('../controllers/admin');

router.get('/stats', auth, requireRole('admin'), getStats);
router.get('/users', auth, requireRole('admin'), listUsers);
router.delete('/users/:id', auth, requireRole('admin'), deleteUser);

module.exports = router;
