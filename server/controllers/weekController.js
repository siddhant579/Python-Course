const asyncHandler = require('../utils/asyncHandler');
const Week = require('../models/Week');
const crudFactory = require('../services/crudFactory');
const { success } = require('../utils/apiResponse');

const base = crudFactory(Week);

// GET /api/courses/:courseId/weeks
const getByCourse = asyncHandler(async (req, res) => {
  const filter = { courseId: req.params.courseId };
  if (req.user?.role !== 'admin') filter.isPublished = true;
  const weeks = await Week.find(filter).sort({ weekNumber: 1 });
  return success(res, weeks);
});

module.exports = { ...base, getByCourse };
