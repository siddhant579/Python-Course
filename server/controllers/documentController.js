const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');
const CourseDocument = require('../models/CourseDocument');
const Week = require('../models/Week');
const Topic = require('../models/Topic');
const Lesson = require('../models/Lesson');
const { buildDraftStructure } = require('../services/pdfDraftService');

// POST /api/documents/upload  (multipart/form-data, field name "file")
const upload = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  if (!courseId) throw new ApiError('courseId is required', 400);
  if (!req.file) throw new ApiError('A PDF file is required', 400);

  const doc = await CourseDocument.create({
    courseId,
    fileName: req.file.originalname,
    fileUrl: `/uploads/${req.file.filename}`,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    status: 'uploaded',
    uploadedBy: req.user._id,
  });

  return success(res, doc, 201);
});

// GET /api/documents?courseId=
const getAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.courseId) filter.courseId = req.query.courseId;
  const docs = await CourseDocument.find(filter).sort({ createdAt: -1 }).populate('uploadedBy', 'name email');
  return success(res, docs);
});

// GET /api/documents/:id
const getOne = asyncHandler(async (req, res) => {
  const doc = await CourseDocument.findById(req.params.id).populate('uploadedBy', 'name email');
  if (!doc) throw new ApiError('Document not found', 404);
  return success(res, doc);
});

// POST /api/documents/:id/process - extracts text from the stored PDF and
// builds a DRAFT structure. Never touches Week/Topic/Lesson collections yet.
const process = asyncHandler(async (req, res) => {
  const doc = await CourseDocument.findById(req.params.id);
  if (!doc) throw new ApiError('Document not found', 404);

  doc.status = 'processing';
  await doc.save();

  try {
    const filePath = path.join(__dirname, '..', doc.fileUrl.replace(/^\/uploads\//, 'uploads/'));
    const buffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(buffer);

    doc.extractedText = parsed.text;
    doc.draftStructure = buildDraftStructure(parsed.text);
    doc.status = 'draft';
    doc.processedAt = new Date();
    await doc.save();
  } catch (err) {
    doc.status = 'failed';
    doc.failureReason = err.message;
    await doc.save();
    throw new ApiError(`PDF processing failed: ${err.message}`, 422);
  }

  return success(res, doc);
});

// PUT /api/documents/:id/draft - admin edits the draft JSON before publishing
const updateDraft = asyncHandler(async (req, res) => {
  const doc = await CourseDocument.findById(req.params.id);
  if (!doc) throw new ApiError('Document not found', 404);
  if (!['draft', 'reviewed'].includes(doc.status)) {
    throw new ApiError(`Cannot edit a document in status "${doc.status}"`, 400);
  }
  doc.draftStructure = req.body.draftStructure;
  doc.status = 'reviewed';
  doc.reviewedBy = req.user._id;
  await doc.save();
  return success(res, doc);
});

// POST /api/documents/:id/publish - materializes the reviewed draft into real
// Week/Topic/Lesson documents (created UNPUBLISHED so the admin still does a
// final publish pass per item), then marks the document published.
const publish = asyncHandler(async (req, res) => {
  const doc = await CourseDocument.findById(req.params.id);
  if (!doc) throw new ApiError('Document not found', 404);
  if (doc.status !== 'reviewed') {
    throw new ApiError('Document must be reviewed before it can be published', 400);
  }
  if (!doc.draftStructure?.weeks?.length) {
    throw new ApiError('Draft has no content to publish', 400);
  }

  const existingWeeks = await Week.countDocuments({ courseId: doc.courseId });

  for (const [wIdx, w] of doc.draftStructure.weeks.entries()) {
    const week = await Week.create({
      courseId: doc.courseId,
      weekNumber: existingWeeks + wIdx + 1,
      title: w.title,
      description: '',
      order: existingWeeks + wIdx,
      isPublished: false,
      sourceDocumentId: doc._id,
    });

    for (const [tIdx, t] of (w.topics || []).entries()) {
      const topic = await Topic.create({
        courseId: doc.courseId,
        weekId: week._id,
        title: t.title,
        description: '',
        order: tIdx,
        isPublished: false,
      });

      const contentText = (t.contentLines || []).join('\n');
      await Lesson.create({
        courseId: doc.courseId,
        weekId: week._id,
        topicId: topic._id,
        title: t.title,
        description: '',
        content: contentText ? [{ type: 'text', text: contentText }] : [],
        order: 0,
        isPublished: false,
      });
    }
  }

  doc.status = 'published';
  doc.publishedAt = new Date();
  await doc.save();

  return success(res, doc);
});

// DELETE /api/documents/:id
const remove = asyncHandler(async (req, res) => {
  const doc = await CourseDocument.findById(req.params.id);
  if (!doc) throw new ApiError('Document not found', 404);
  const filePath = path.join(__dirname, '..', doc.fileUrl.replace(/^\/uploads\//, 'uploads/'));
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  await doc.deleteOne();
  return success(res, { deleted: true });
});

module.exports = { upload, getAll, getOne, process, updateDraft, publish, remove };
