const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getAdminStats } = require('../controllers/userController');

router.get('/stats', protect, authorize('admin'), getAdminStats);

module.exports = router;
