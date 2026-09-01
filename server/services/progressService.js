const Week = require('../models/Week');
const Topic = require('../models/Topic');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');

// Recomputes overallPercent from scratch off the published course tree +
// the student's completed lesson list. Backend is the source of truth for
// progress, never trusted from the client.
async function recalculateCourseProgress(userId, courseId) {
  const weeks = await Week.find({ courseId, isPublished: true }).select('_id');
  const weekIds = weeks.map((w) => w._id);
  const topics = await Topic.find({ weekId: { $in: weekIds }, isPublished: true }).select('_id weekId');
  const topicIds = topics.map((t) => t._id);
  const lessons = await Lesson.find({ topicId: { $in: topicIds }, isPublished: true }).select('_id topicId');

  let progress = await Progress.findOne({ userId, courseId });
  if (!progress) {
    progress = await Progress.create({ userId, courseId });
  }

  const completedLessonIds = new Set(progress.completedLessons.map(String));
  const totalLessons = lessons.length;
  const completedCount = lessons.filter((l) => completedLessonIds.has(String(l._id))).length;
  const overallPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Derive completed topics (all lessons in topic done) and weeks (all topics done)
  const lessonsByTopic = {};
  lessons.forEach((l) => {
    const key = String(l.topicId);
    lessonsByTopic[key] = lessonsByTopic[key] || [];
    lessonsByTopic[key].push(l._id);
  });
  const completedTopics = topics
    .filter((t) => {
      const topicLessons = lessonsByTopic[String(t._id)] || [];
      return topicLessons.length > 0 && topicLessons.every((id) => completedLessonIds.has(String(id)));
    })
    .map((t) => t._id);

  const topicsByWeek = {};
  topics.forEach((t) => {
    const key = String(t.weekId);
    topicsByWeek[key] = topicsByWeek[key] || [];
    topicsByWeek[key].push(t._id);
  });
  const completedTopicIds = new Set(completedTopics.map(String));
  const completedWeeks = weeks
    .filter((w) => {
      const weekTopics = topicsByWeek[String(w._id)] || [];
      return weekTopics.length > 0 && weekTopics.every((id) => completedTopicIds.has(String(id)));
    })
    .map((w) => w._id);

  progress.completedTopics = completedTopics;
  progress.completedWeeks = completedWeeks;
  progress.overallPercent = overallPercent;
  progress.lastActivityAt = new Date();
  await progress.save();

  return progress;
}

module.exports = { recalculateCourseProgress };
