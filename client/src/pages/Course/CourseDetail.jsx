import { Link, useParams } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import courseApi from '../../services/courseApi';
import progressApi from '../../services/progressApi';
import useAuth from '../../hooks/useAuth';
import CurriculumTable from '../../components/course/CurriculumTable.jsx';
import ProgressBar from '../../components/common/ProgressBar.jsx';
import { PageLoader } from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Badge from '../../components/common/Badge.jsx';

export default function CourseDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const { data, loading, error, refetch } = useFetch(() => courseApi.getStructure(id), [id]);
  const { data: progress } = useFetch(
    () => (isAuthenticated ? progressApi.getForCourse(id) : Promise.resolve(null)),
    [id, isAuthenticated]
  );

  if (loading) return <PageLoader label="Loading course..." />;
  if (error) return <div className="mx-auto max-w-4xl px-4 py-10"><ErrorState message={error} onRetry={refetch} /></div>;
  if (!data) return null;

  const { course, weeks } = data;

  const weekPercent = (week) => {
    if (!progress) return 0;
    const lessonIds = week.topics.flatMap((t) => t.lessons.map((l) => l._id));
    if (lessonIds.length === 0) return 0;
    const done = lessonIds.filter((id2) => progress.completedLessons?.some((c) => String(c) === String(id2))).length;
    return Math.round((done / lessonIds.length) * 100);
  };

  return (
    <div>
      <div className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Badge variant="brand">{course.category}</Badge>
            <Badge variant="neutral">{course.level}</Badge>
          </div>
          <h1 className="mt-3 text-3xl font-bold text-ink-900">{course.title}</h1>
          <p className="mt-2 max-w-2xl text-ink-600">{course.description}</p>

          {isAuthenticated && (
            <div className="mt-6 max-w-sm">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-ink-700">Overall Progress</span>
                <span className="font-semibold text-brand-600">{progress?.overallPercent ?? 0}%</span>
              </div>
              <ProgressBar percent={progress?.overallPercent ?? 0} />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Course Curriculum</h2>
          <Link to={`/courses/${course._id}/topics`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all topics →
          </Link>
        </div>
        {weeks.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No weeks published yet"
            description="This course's content is being prepared. Check back soon."
          />
        ) : (
          <CurriculumTable
            courseId={course._id}
            weeks={weeks}
            completedWeeks={progress?.completedWeeks}
            completedTopics={progress?.completedTopics}
            percentFor={weekPercent}
          />
        )}
      </div>
    </div>
  );
}
