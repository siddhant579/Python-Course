const router = require('express').Router();
const { attachUserIfPresent } = require('../middleware/auth');

const authRoutes = require('./authRoutes');
const courseRoutes = require('./courseRoutes');
const weekRoutes = require('./weekRoutes');
const topicRoutes = require('./topicRoutes');
const lessonRoutes = require('./lessonRoutes');
const exerciseRoutes = require('./exerciseRoutes');
const quizRoutes = require('./quizRoutes');
const questionRoutes = require('./questionRoutes');
const progressRoutes = require('./progressRoutes');
const documentRoutes = require('./documentRoutes');
const userRoutes = require('./userRoutes');
const adminRoutes = require('./adminRoutes');

const weekController = require('../controllers/weekController');
const topicController = require('../controllers/topicController');
const lessonController = require('../controllers/lessonController');
const exerciseController = require('../controllers/exerciseController');
const quizController = require('../controllers/quizController');
const questionController = require('../controllers/questionController');

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/weeks', weekRoutes);
router.use('/topics', topicRoutes);
router.use('/lessons', lessonRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/quizzes', quizRoutes);
router.use('/questions', questionRoutes);
router.use('/progress', progressRoutes);
router.use('/documents', documentRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

// Nested convenience GETs exactly as specified in the API design doc:
router.get('/courses/:courseId/weeks', attachUserIfPresent, weekController.getByCourse);
router.get('/weeks/:weekId/topics', attachUserIfPresent, topicController.getByWeek);
router.get('/topics/:topicId/lessons', attachUserIfPresent, lessonController.getByTopic);
router.get('/lessons/:lessonId/exercises', attachUserIfPresent, exerciseController.getByLesson);
router.get('/weeks/:weekId/quizzes', attachUserIfPresent, quizController.getByWeek);
router.get('/quizzes/:quizId/questions', require('../middleware/auth').protect, require('../middleware/auth').authorize('admin'), questionController.getByQuiz);

module.exports = router;
