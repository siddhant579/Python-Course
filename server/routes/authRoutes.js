const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', protect, ctrl.getMe);
router.put('/me', protect, ctrl.updateMe);
router.put('/password', protect, ctrl.changePassword);

module.exports = router;
