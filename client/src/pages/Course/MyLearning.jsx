import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle } from 'lucide-react';
import courseApi from '../../services/courseApi';
import progressApi from '../../services/progressApi';
import { PageLoader } from '../../components/common/Spinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ProgressBar from '../../components/common/ProgressBar.jsx';
import Badge from '../../components/common/Badge.jsx';

export default function MyLearning() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const courses = await courseApi.getAll();
        const withProgress = await Promise.all(
          courses.map(async (course) => {
            const progress = await progressApi.getForCourse(course._id).catch(() => null);
            return { course, progress };
          })
        );
        if (active) setRows(withProgress);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) return <PageLoader label="Loading your courses..." />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">My Learning</h1>
      <p className="mt-1 text-ink-500">Continue where you left off.</p>

      {(!rows || rows.length === 0) ? (
        <div className="mt-8">
          <EmptyState
            icon={BookOpen}
            title="No courses available yet"
            description="Once a course is published you'll see it here."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {rows.map(({ course, progress }) => {
            const continueUrl = progress?.currentLessonId
              ? `/lessons/${progress.currentLessonId}`
              : `/courses/${course._id}`;
            return (
              <div key={course._id} className="card p-5">
                <Badge variant="brand">{course.category}</Badge>
                <h3 className="mt-3 font-semibold text-ink-900">{course.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-ink-500">{course.description}</p>
                <div className="mt-4">
                  <ProgressBar percent={progress?.overallPercent ?? 0} size="sm" showLabel />
                </div>
                <Link to={continueUrl} className="btn-primary mt-4 w-full">
                  <PlayCircle size={16} /> {progress?.overallPercent > 0 ? 'Continue Learning' : 'Start Course'}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
