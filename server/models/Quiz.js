const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    weekId: { type: mongoose.Schema.Types.ObjectId, ref: 'Week', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, default: '', maxlength: 1000 },
    timeLimitMinutes: { type: Number, default: 0 }, // 0 = untimed
    passPercent: { type: Number, default: 60 },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

quizSchema.index({ weekId: 1, order: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
