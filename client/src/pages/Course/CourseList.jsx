import { BookOpen } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import courseApi from '../../services/courseApi';
import CourseCard from '../../components/course/CourseCard.jsx';
import { PageLoader } from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function CourseList() {
  const { data: courses, loading, error, refetch } = useFetch(() => courseApi.getAll(), []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-900">Courses</h1>
        <p className="mt-1 text-ink-500">Pick a course to start learning.</p>
      </div>

      {loading && <PageLoader label="Loading courses..." />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && (!courses || courses.length === 0) && (
        <EmptyState
          icon={BookOpen}
          title="No courses published yet"
          description="Check back soon — course content is added by the admin team."
        />
      )}
      {!loading && !error && courses?.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => <CourseCard key={c._id} course={c} />)}
        </div>
      )}
    </div>
  );
}
