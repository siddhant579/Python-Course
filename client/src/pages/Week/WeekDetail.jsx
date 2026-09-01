import { Link, useParams } from 'react-router-dom';
import { FileText, CheckCircle2, Circle, HelpCircle, ChevronLeft } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import courseApi from '../../services/courseApi';
import progressApi from '../../services/progressApi';
import useAuth from '../../hooks/useAuth';
import { PageLoader } from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import Breadcrumb from '../../components/common/Breadcrumb.jsx';

export default function WeekDetail() {
  const { courseId, weekId } = useParams();
  const { isAuthenticated } = useAuth();

  const { data, loading, error, refetch } = useFetch(() => courseApi.getStructure(courseId), [courseId]);
  const { data: progress } = useFetch(
    () => (isAuthenticated ? progressApi.getForCourse(courseId) : Promise.resolve(null)),
    [courseId, isAuthenticated]
  );

  if (loading) return <PageLoader label="Loading week..." />;
  if (error) return <div className="mx-auto max-w-4xl px-4 py-10"><ErrorState message={error} onRetry={refetch} /></div>;

  const week = data?.weeks.find((w) => w._id === weekId);
  if (!week) return <div className="mx-auto max-w-4xl px-4 py-10"><ErrorState message="Week not found" /></div>;

  const isLessonDone = (lessonId) => progress?.completedLessons?.some((id) => String(id) === String(lessonId));

  return (
    <div>
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-100">Week {week.weekNumber}</span>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{week.title}</h1>
          {week.description && <p className="mx-auto mt-3 max-w-xl text-brand-50">{week.description}</p>}
        </div>
      </div>

      <div className="border-b border-brand-100 bg-brand-50">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Courses', to: '/courses' },
              { label: data.course.title, to: `/courses/${courseId}` },
              { label: `Week ${week.weekNumber}` },
            ]}
          />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to={`/courses/${courseId}`} className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
        <ChevronLeft size={15} /> Back to course
      </Link>

      <div className="space-y-6">
        {week.topics.map((topic) => (
          <div key={topic._id} className="card p-5">
            <h3 className="font-semibold text-ink-800">{topic.title}</h3>
            {topic.description && <p className="mt-1 text-sm text-ink-500">{topic.description}</p>}
            <ul className="mt-4 space-y-1">
              {topic.lessons.map((lesson) => (
                <li key={lesson._id}>
                  <Link
                    to={`/lessons/${lesson._id}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-ink-50"
                  >
                    {isLessonDone(lesson._id) ? (
                      <CheckCircle2 size={17} className="flex-shrink-0 text-emerald-500" />
                    ) : (
                      <Circle size={17} className="flex-shrink-0 text-ink-300" />
                    )}
                    <FileText size={15} className="flex-shrink-0 text-ink-400" />
                    <span className="text-ink-700">{lesson.title}</span>
                    {lesson.exerciseCount > 0 && (
                      <span className="ml-auto text-xs text-ink-400">{lesson.exerciseCount} exercises</span>
                    )}
                  </Link>
                </li>
              ))}
              {topic.lessons.length === 0 && <li className="px-3 py-2 text-sm text-ink-400">No lessons yet.</li>}
            </ul>
          </div>
        ))}

        {week.quizzes?.length > 0 && (
          <div className="card p-5">
            <h3 className="mb-3 font-semibold text-ink-800">Quizzes</h3>
            <ul className="space-y-1">
              {week.quizzes.map((quiz) => (
                <li key={quiz._id}>
                  <Link to={`/quizzes/${quiz._id}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-ink-50">
                    <HelpCircle size={17} className="text-accent-600" />
                    <span className="text-ink-700">{quiz.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
