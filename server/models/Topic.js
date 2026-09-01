const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    weekId: { type: mongoose.Schema.Types.ObjectId, ref: 'Week', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, default: '', maxlength: 2000 },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

topicSchema.index({ weekId: 1, order: 1 });

module.exports = mongoose.model('Topic', topicSchema);
