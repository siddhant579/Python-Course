const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');
const Course = require('../models/Course');
const Week = require('../models/Week');
const Topic = require('../models/Topic');
const Lesson = require('../models/Lesson');
const Exercise = require('../models/Exercise');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const crudFactory = require('../services/crudFactory');

const base = crudFactory(Course);

// GET /api/courses - students only see published courses; admins see all
const getAll = asyncHandler(async (req, res) => {
  const filter = req.user?.role === 'admin' ? {} : { isPublished: true };
  if (req.query.category) filter.category = req.query.category;
  const courses = await Course.find(filter).sort({ createdAt: -1 });
  return success(res, courses);
});

const getOne = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError('Course not found', 404);
  if (!course.isPublished && req.user?.role !== 'admin') {
    throw new ApiError('Course not found', 404);
  }
  return success(res, course);
});

// GET /api/courses/:id/structure - full nested tree, used by the course overview page
const getStructure = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError('Course not found', 404);

  const publishedOnly = req.user?.role !== 'admin';
  const weekFilter = { courseId: course._id, ...(publishedOnly ? { isPublished: true } : {}) };
  const weeks = await Week.find(weekFilter).sort({ weekNumber: 1 });

  const weekIds = weeks.map((w) => w._id);
  const topicFilter = { weekId: { $in: weekIds }, ...(publishedOnly ? { isPublished: true } : {}) };
  const topics = await Topic.find(topicFilter).sort({ order: 1 });

  const topicIds = topics.map((t) => t._id);
  const lessonFilter = { topicId: { $in: topicIds }, ...(publishedOnly ? { isPublished: true } : {}) };
  const lessons = await Lesson.find(lessonFilter).select('-content').sort({ order: 1 });

  const [exerciseCounts, quizzes] = await Promise.all([
    Exercise.aggregate([
      { $match: { lessonId: { $in: lessons.map((l) => l._id) } } },
      { $group: { _id: '$lessonId', count: { $sum: 1 } } },
    ]),
    Quiz.find({ weekId: { $in: weekIds }, ...(publishedOnly ? { isPublished: true } : {}) }).sort({ order: 1 }),
  ]);

  const exerciseCountMap = Object.fromEntries(exerciseCounts.map((e) => [String(e._id), e.count]));

  const tree = weeks.map((week) => {
    const weekTopics = topics
      .filter((t) => String(t.weekId) === String(week._id))
      .map((topic) => {
        const topicLessons = lessons
          .filter((l) => String(l.topicId) === String(topic._id))
          .map((lesson) => ({
            ...lesson.toObject(),
            exerciseCount: exerciseCountMap[String(lesson._id)] || 0,
          }));
        return { ...topic.toObject(), lessons: topicLessons };
      });
    const weekQuizzes = quizzes.filter((q) => String(q.weekId) === String(week._id));
    return {
      ...week.toObject(),
      topics: weekTopics,
      quizzes: weekQuizzes,
      topicCount: weekTopics.length,
      lessonCount: weekTopics.reduce((sum, t) => sum + t.lessons.length, 0),
      exerciseCount: weekTopics.reduce(
        (sum, t) => sum + t.lessons.reduce((s, l) => s + l.exerciseCount, 0),
        0
      ),
      quizCount: weekQuizzes.length,
    };
  });

  return success(res, { course, weeks: tree });
});

// DELETE /api/courses/:id - also cascades to everything nested under it
const remove = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError('Course not found', 404);

  const weeks = await Week.find({ courseId: course._id }).select('_id');
  const weekIds = weeks.map((w) => w._id);
  const topics = await Topic.find({ weekId: { $in: weekIds } }).select('_id');
  const topicIds = topics.map((t) => t._id);
  const lessons = await Lesson.find({ topicId: { $in: topicIds } }).select('_id');
  const lessonIds = lessons.map((l) => l._id);
  const quizzes = await Quiz.find({ weekId: { $in: weekIds } }).select('_id');
  const quizIds = quizzes.map((q) => q._id);

  await Promise.all([
    Exercise.deleteMany({ lessonId: { $in: lessonIds } }),
    Question.deleteMany({ quizId: { $in: quizIds } }),
    Quiz.deleteMany({ weekId: { $in: weekIds } }),
    Lesson.deleteMany({ topicId: { $in: topicIds } }),
    Topic.deleteMany({ weekId: { $in: weekIds } }),
    Week.deleteMany({ courseId: course._id }),
    course.deleteOne(),
  ]);

  return success(res, { deleted: true });
});

module.exports = { ...base, getAll, getOne, getStructure, remove };
