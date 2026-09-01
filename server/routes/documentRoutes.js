const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/documentController');

router.post('/upload', protect, authorize('admin'), upload.single('file'), ctrl.upload);
router.get('/', protect, authorize('admin'), ctrl.getAll);
router.get('/:id', protect, authorize('admin'), ctrl.getOne);
router.post('/:id/process', protect, authorize('admin'), ctrl.process);
router.put('/:id/draft', protect, authorize('admin'), ctrl.updateDraft);
router.post('/:id/publish', protect, authorize('admin'), ctrl.publish);
router.delete('/:id', protect, authorize('admin'), ctrl.remove);

module.exports = router;
