const mongoose = require('mongoose');

const DOCUMENT_STATUSES = ['uploaded', 'processing', 'draft', 'reviewed', 'published', 'failed'];

const courseDocumentSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: 'application/pdf' },
    fileSize: { type: Number, default: 0 },
    status: { type: String, enum: DOCUMENT_STATUSES, default: 'uploaded', index: true },
    // Raw text pulled from the PDF - the ONLY source for draft content generation.
    extractedText: { type: String, default: '' },
    // Structured draft built from extractedText, awaiting admin review before
    // it is turned into real Week/Topic/Lesson documents.
    draftStructure: { type: mongoose.Schema.Types.Mixed, default: null },
    failureReason: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CourseDocument', courseDocumentSchema);
module.exports.DOCUMENT_STATUSES = DOCUMENT_STATUSES;
