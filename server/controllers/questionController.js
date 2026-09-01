const asyncHandler = require('../utils/asyncHandler');
const Question = require('../models/Question');
const crudFactory = require('../services/crudFactory');
const { success } = require('../utils/apiResponse');

const base = crudFactory(Question);

// GET /api/quizzes/:quizId/questions (admin authoring view - includes correct answers)
const getByQuiz = asyncHandler(async (req, res) => {
  const questions = await Question.find({ quizId: req.params.quizId }).sort({ order: 1 });
  return success(res, questions);
});

module.exports = { ...base, getByQuiz };
