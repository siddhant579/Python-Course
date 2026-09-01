const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');
const Progress = require('../models/Progress');
const Exercise = require('../models/Exercise');
const { recalculateCourseProgress } = require('../services/progressService');

// GET /api/progress/:courseId
const getForCourse = asyncHandler(async (req, res) => {
  let progress = await Progress.findOne({ userId: req.user._id, courseId: req.params.courseId });
  if (!progress) {
    progress = await recalculateCourseProgress(req.user._id, req.params.courseId);
  }
  return success(res, progress);
});

// POST /api/progress/lesson  { courseId, lessonId, weekId }
const markLessonComplete = asyncHandler(async (req, res) => {
  const { courseId, lessonId, weekId } = req.body;
  if (!courseId || !lessonId) throw new ApiError('courseId and lessonId are required', 400);

  let progress = await Progress.findOne({ userId: req.user._id, courseId });
  if (!progress) progress = await Progress.create({ userId: req.user._id, courseId });

  if (!progress.completedLessons.some((id) => String(id) === String(lessonId))) {
    progress.completedLessons.push(lessonId);
  }
  if (weekId) progress.currentWeekId = weekId;
  progress.currentLessonId = lessonId;
  await progress.save();

  const updated = await recalculateCourseProgress(req.user._id, courseId);
  return success(res, updated);
});

// POST /api/progress/exercise  { courseId, exerciseId }
const markExerciseComplete = asyncHandler(async (req, res) => {
  const { courseId, exerciseId } = req.body;
  if (!courseId || !exerciseId) throw new ApiError('courseId and exerciseId are required', 400);

  const exercise = await Exercise.findById(exerciseId);
  if (!exercise) throw new ApiError('Exercise not found', 404);

  let progress = await Progress.findOne({ userId: req.user._id, courseId });
  if (!progress) progress = await Progress.create({ userId: req.user._id, courseId });

  if (!progress.completedExercises.some((id) => String(id) === String(exerciseId))) {
    progress.completedExercises.push(exerciseId);
  }
  progress.lastActivityAt = new Date();
  await progress.save();

  return success(res, progress);
});

// POST /api/progress/week  { courseId, weekId } - manual override/bookmark, e.g. "set current week"
const setCurrentWeek = asyncHandler(async (req, res) => {
  const { courseId, weekId } = req.body;
  if (!courseId || !weekId) throw new ApiError('courseId and weekId are required', 400);

  let progress = await Progress.findOne({ userId: req.user._id, courseId });
  if (!progress) progress = await Progress.create({ userId: req.user._id, courseId });

  progress.currentWeekId = weekId;
  progress.lastActivityAt = new Date();
  await progress.save();

  return success(res, progress);
});

module.exports = { getForCourse, markLessonComplete, markExerciseComplete, setCurrentWeek };
