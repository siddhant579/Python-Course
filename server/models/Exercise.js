const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    instructions: { type: String, required: true, maxlength: 3000 },
    starterCode: { type: String, default: '' },
    hints: { type: [String], default: [] },
    expectedOutput: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

exerciseSchema.index({ lessonId: 1, order: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);
