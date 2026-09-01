const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

router.get('/students', protect, authorize('admin'), ctrl.getStudents);
router.get('/students/:id/progress', protect, authorize('admin'), ctrl.getStudentProgress);
router.put('/:id/status', protect, authorize('admin'), ctrl.setActive);

module.exports = router;
