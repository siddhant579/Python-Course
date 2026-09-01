const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    type: { type: String, enum: ['mcq', 'truefalse', 'short', 'code'], default: 'mcq' },
    text: { type: String, required: true, maxlength: 1000 },
    options: {
      type: [String],
      default: [],
      validate: {
        validator: function validateOptions(opts) {
          if (this.type === 'mcq') return opts.length >= 2;
          return true;
        },
        message: 'MCQ questions need at least 2 options',
      },
    },
    // For type "code": the student edits/runs starterCode in an in-browser
    // Python runner; correctAnswer holds the expected stdout, and their
    // submitted "answer" is the actual captured output (graded the same
    // string-compare way as every other question type - no server-side
    // code execution involved).
    starterCode: { type: String, default: '' }, // type: code only
    hints: { type: [String], default: [] }, // type: code only
    correctAnswer: { type: String, required: true }, // option text (mcq), 'true'/'false' (truefalse), exact text (short), expected output (code)
    explanation: { type: String, default: '', maxlength: 1000 },
    points: { type: Number, default: 1 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

questionSchema.index({ quizId: 1, order: 1 });

module.exports = mongoose.model('Question', questionSchema);
