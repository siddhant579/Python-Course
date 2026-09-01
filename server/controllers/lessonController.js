const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Lesson = require('../models/Lesson');
const crudFactory = require('../services/crudFactory');
const { success } = require('../utils/apiResponse');

const base = crudFactory(Lesson);

// GET /api/topics/:topicId/lessons
const getByTopic = asyncHandler(async (req, res) => {
  const filter = { topicId: req.params.topicId };
  if (req.user?.role !== 'admin') filter.isPublished = true;
  const lessons = await Lesson.find(filter).select('-content').sort({ order: 1 });
  return success(res, lessons);
});

// GET /api/lessons/:id - full lesson content, plus prev/next lesson ids for
// the bottom navigation on the lesson page.
const getOne = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) throw new ApiError('Lesson not found', 404);
  if (!lesson.isPublished && req.user?.role !== 'admin') throw new ApiError('Lesson not found', 404);

  const siblingFilter = { topicId: lesson.topicId };
  if (req.user?.role !== 'admin') siblingFilter.isPublished = true;
  const siblings = await Lesson.find(siblingFilter).select('_id order').sort({ order: 1 });
  const idx = siblings.findIndex((s) => String(s._id) === String(lesson._id));

  return success(res, {
    lesson,
    prevLessonId: idx > 0 ? siblings[idx - 1]._id : null,
    nextLessonId: idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1]._id : null,
  });
});

module.exports = { ...base, getByTopic, getOne };
