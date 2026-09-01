const asyncHandler = require('../utils/asyncHandler');
const Topic = require('../models/Topic');
const crudFactory = require('../services/crudFactory');
const { success } = require('../utils/apiResponse');

const base = crudFactory(Topic);

// GET /api/weeks/:weekId/topics
const getByWeek = asyncHandler(async (req, res) => {
  const filter = { weekId: req.params.weekId };
  if (req.user?.role !== 'admin') filter.isPublished = true;
  const topics = await Topic.find(filter).sort({ order: 1 });
  return success(res, topics);
});

module.exports = { ...base, getByWeek };
