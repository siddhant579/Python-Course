import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, BookOpen } from 'lucide-react';
import courseApi from '../../services/courseApi';
import progressApi from '../../services/progressApi';
import { PageLoader } from '../../components/common/Spinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ProgressBar from '../../components/common/ProgressBar.jsx';

export default function ProgressPage() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const courses = await courseApi.getAll();
        const withProgress = await Promise.all(
          courses.map(async (course) => {
            try {
              const progress = await progressApi.getForCourse(course._id);
              return { course, progress };
            } catch {
              return { course, progress: null };
            }
          })
        );
        if (active) setRows(withProgress.filter((r) => r.progress && (r.progress.completedLessons?.length > 0 || r.progress.overallPercent > 0)));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) return <PageLoader label="Loading your progress..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
          <TrendingUp size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Your Progress</h1>
          <p className="text-sm text-ink-500">Track how far you've come in each course.</p>
        </div>
      </div>

      {(!rows || rows.length === 0) ? (
        <EmptyState
          icon={BookOpen}
          title="No progress yet"
          description="Start a lesson to begin tracking your progress here."
          action={<Link to="/courses" className="btn-primary">Browse Courses</Link>}
        />
      ) : (
        <div className="space-y-4">
          {rows.map(({ course, progress }) => (
            <Link key={course._id} to={`/courses/${course._id}`} className="card block p-5 hover:shadow-cardHover">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-ink-800">{course.title}</h3>
                <span className="text-sm font-semibold text-brand-600">{progress.overallPercent}%</span>
              </div>
              <div className="mt-3">
                <ProgressBar percent={progress.overallPercent} size="sm" />
              </div>
              <div className="mt-3 flex gap-4 text-xs text-ink-500">
                <span>{progress.completedLessons?.length || 0} lessons completed</span>
                <span>{progress.completedExercises?.length || 0} exercises completed</span>
                <span>{progress.completedWeeks?.length || 0} weeks completed</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
