const asyncHandler = require('../utils/asyncHandler');
const Exercise = require('../models/Exercise');
const crudFactory = require('../services/crudFactory');
const { success } = require('../utils/apiResponse');

const base = crudFactory(Exercise);

// GET /api/lessons/:lessonId/exercises
const getByLesson = asyncHandler(async (req, res) => {
  const filter = { lessonId: req.params.lessonId };
  if (req.user?.role !== 'admin') filter.isPublished = true;
  const exercises = await Exercise.find(filter).sort({ order: 1 });
  return success(res, exercises);
});

module.exports = { ...base, getByLesson };
