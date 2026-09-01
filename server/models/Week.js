const mongoose = require('mongoose');

const weekSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    weekNumber: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, default: '', maxlength: 2000 },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    sourceDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseDocument' },
  },
  { timestamps: true }
);

weekSchema.index({ courseId: 1, weekNumber: 1 }, { unique: true });

module.exports = mongoose.model('Week', weekSchema);
