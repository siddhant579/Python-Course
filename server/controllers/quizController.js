const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const crudFactory = require('../services/crudFactory');
const { success } = require('../utils/apiResponse');
const { recalculateCourseProgress } = require('../services/progressService');

const base = crudFactory(Quiz);

// GET /api/weeks/:weekId/quizzes
const getByWeek = asyncHandler(async (req, res) => {
  const filter = { weekId: req.params.weekId };
  if (req.user?.role !== 'admin') filter.isPublished = true;
  const quizzes = await Quiz.find(filter).sort({ order: 1 });
  return success(res, quizzes);
});

// GET /api/quizzes/:id - includes questions; correctAnswer/explanation stripped for students
const getOne = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) throw new ApiError('Quiz not found', 404);
  if (!quiz.isPublished && req.user?.role !== 'admin') throw new ApiError('Quiz not found', 404);

  const questions = await Question.find({ quizId: quiz._id }).sort({ order: 1 });
  const isAdmin = req.user?.role === 'admin';
  const safeQuestions = questions.map((q) => {
    const obj = q.toObject();
    if (!isAdmin) {
      delete obj.correctAnswer;
      delete obj.explanation;
    }
    return obj;
  });

  return success(res, { quiz, questions: safeQuestions });
});

// POST /api/quizzes/:quizId/submit
const submit = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);
  if (!quiz) throw new ApiError('Quiz not found', 404);

  const { answers } = req.body; // [{ questionId, answer }]
  if (!Array.isArray(answers)) throw new ApiError('answers array is required', 400);

  const questions = await Question.find({ quizId: quiz._id });
  const questionMap = new Map(questions.map((q) => [String(q._id), q]));

  let score = 0;
  let totalPoints = 0;
  const gradedAnswers = questions.map((q) => {
    totalPoints += q.points;
    const submitted = answers.find((a) => String(a.questionId) === String(q._id));
    const given = submitted ? String(submitted.answer).trim() : '';
    const isCorrect = given.toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
    const pointsAwarded = isCorrect ? q.points : 0;
    score += pointsAwarded;
    return { questionId: q._id, answer: given, isCorrect, pointsAwarded };
  });

  const percent = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

  const attempt = await QuizAttempt.create({
    userId: req.user._id,
    quizId: quiz._id,
    courseId: quiz.courseId,
    answers: gradedAnswers,
    score,
    totalPoints,
    percent,
    passed: percent >= (quiz.passPercent || 60),
    submittedAt: new Date(),
  });

  await recalculateCourseProgress(req.user._id, quiz.courseId);

  return success(res, { attempt }, 201);
});

// GET /api/quizzes/:quizId/results - the student's own attempt history for this quiz
const getResults = asyncHandler(async (req, res) => {
  const filter = { quizId: req.params.quizId };
  if (req.user.role !== 'admin') filter.userId = req.user._id;
  const attempts = await QuizAttempt.find(filter).sort({ createdAt: -1 });

  const questions = await Question.find({ quizId: req.params.quizId }).sort({ order: 1 });
  return success(res, { attempts, questions });
});

module.exports = { ...base, getByWeek, getOne, submit, getResults };
