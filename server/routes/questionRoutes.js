const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/questionController');

router.get('/', protect, authorize('admin'), ctrl.getAll);
router.post('/', protect, authorize('admin'), ctrl.create);
router.put('/reorder', protect, authorize('admin'), ctrl.reorder);
router.get('/:id', protect, authorize('admin'), ctrl.getOne);
router.put('/:id', protect, authorize('admin'), ctrl.update);
router.delete('/:id', protect, authorize('admin'), ctrl.remove);

module.exports = router;
