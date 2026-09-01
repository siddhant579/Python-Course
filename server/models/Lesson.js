const mongoose = require('mongoose');

// A content block lets a lesson interleave text, code examples and images
// in the order the admin authored them, instead of forcing fixed fields.
const contentBlockSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['text', 'code', 'image', 'note'], required: true },
    text: { type: String }, // for type: text | note
    code: { type: String }, // for type: code
    language: { type: String, default: 'python' }, // for type: code
    caption: { type: String }, // for type: code | image
    imageUrl: { type: String }, // for type: image
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    weekId: { type: mongoose.Schema.Types.ObjectId, ref: 'Week', required: true, index: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, default: '', maxlength: 500 },
    content: { type: [contentBlockSchema], default: [] },
    order: { type: Number, default: 0 },
    estimatedMinutes: { type: Number, default: 10 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

lessonSchema.index({ topicId: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
