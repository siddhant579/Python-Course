const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');
const User = require('../models/User');
const Course = require('../models/Course');
const Week = require('../models/Week');
const Topic = require('../models/Topic');
const Lesson = require('../models/Lesson');
const Exercise = require('../models/Exercise');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const CourseDocument = require('../models/CourseDocument');
const Progress = require('../models/Progress');

// GET /api/users/students (admin)
const getStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' }).sort({ createdAt: -1 });
  return success(res, students);
});

// GET /api/users/students/:id/progress (admin)
const getStudentProgress = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id);
  if (!student) throw new ApiError('Student not found', 404);
  const progress = await Progress.find({ userId: student._id }).populate('courseId', 'title');
  return success(res, { student: student.toSafeObject(), progress });
});

// PUT /api/users/:id/status (admin) - activate/deactivate a user
const setActive = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  if (!user) throw new ApiError('User not found', 404);
  return success(res, user.toSafeObject());
});

// GET /api/admin/stats - Admin dashboard summary cards + chart data
const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalCourses,
    publishedCourses,
    totalStudents,
    totalWeeks,
    totalTopics,
    totalLessons,
    publishedLessons,
    totalExercises,
    totalQuizzes,
    totalQuestions,
    totalDocuments,
    documentsByStatus,
  ] = await Promise.all([
    Course.countDocuments(),
    Course.countDocuments({ isPublished: true }),
    User.countDocuments({ role: 'student' }),
    Week.countDocuments(),
    Topic.countDocuments(),
    Lesson.countDocuments(),
    Lesson.countDocuments({ isPublished: true }),
    Exercise.countDocuments(),
    Quiz.countDocuments(),
    Question.countDocuments(),
    CourseDocument.countDocuments(),
    CourseDocument.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  return success(res, {
    totalCourses,
    publishedCourses,
    draftCourses: totalCourses - publishedCourses,
    totalStudents,
    totalWeeks,
    totalTopics,
    totalLessons,
    publishedLessons,
    draftLessons: totalLessons - publishedLessons,
    totalExercises,
    totalQuizzes,
    totalQuestions,
    totalDocuments,
    documentsByStatus: documentsByStatus.map((d) => ({ status: d._id, count: d.count })),
  });
});

module.exports = { getStudents, getStudentProgress, setActive, getAdminStats };
