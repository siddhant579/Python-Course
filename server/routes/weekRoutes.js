const router = require('express').Router();
const { protect, authorize, attachUserIfPresent } = require('../middleware/auth');
const ctrl = require('../controllers/weekController');

// mounted at both /api/weeks and nested under /api/courses/:courseId/weeks
router.get('/', attachUserIfPresent, ctrl.getAll);
router.post('/', protect, authorize('admin'), ctrl.create);
router.put('/reorder', protect, authorize('admin'), ctrl.reorder);
router.get('/:id', attachUserIfPresent, ctrl.getOne);
router.put('/:id', protect, authorize('admin'), ctrl.update);
router.delete('/:id', protect, authorize('admin'), ctrl.remove);
router.put('/:id/publish', protect, authorize('admin'), ctrl.publish);
router.put('/:id/unpublish', protect, authorize('admin'), ctrl.unpublish);

module.exports = router;
