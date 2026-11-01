// routes/index.js – mounts all route groups under /api
const router = require('express').Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/auth', require('./auth'));
router.use('/donors', require('./donors'));
router.use('/requests', require('./requests'));
router.use('/admin', require('./admin'));

module.exports = router;
