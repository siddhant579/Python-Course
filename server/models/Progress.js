const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    completedExercises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }],
    completedTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    completedWeeks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Week' }],
    currentWeekId: { type: mongoose.Schema.Types.ObjectId, ref: 'Week' },
    currentLessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    overallPercent: { type: Number, default: 0, min: 0, max: 100 },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
