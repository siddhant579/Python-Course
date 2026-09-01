const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/progressController');

router.get('/:courseId', protect, ctrl.getForCourse);
router.post('/lesson', protect, ctrl.markLessonComplete);
router.post('/exercise', protect, ctrl.markExerciseComplete);
router.post('/week', protect, ctrl.setCurrentWeek);

module.exports = router;
