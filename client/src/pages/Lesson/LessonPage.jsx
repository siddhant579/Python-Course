import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Menu, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import lessonApi from '../../services/lessonApi';
import courseApi from '../../services/courseApi';
import progressApi from '../../services/progressApi';
import { getErrorMessage } from '../../services/api';
import LessonSidebar from '../../components/lesson/LessonSidebar.jsx';
import ContentBlock from '../../components/lesson/ContentBlock.jsx';
import ExerciseCard from '../../components/lesson/ExerciseCard.jsx';
import { PageLoader } from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import Breadcrumb from '../../components/common/Breadcrumb.jsx';

export default function LessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [completing, setCompleting] = useState(false);

  const { data, loading, error, refetch } = useFetch(() => lessonApi.getOne(id), [id]);
  const lesson = data?.lesson;

  const { data: structure } = useFetch(
    () => (lesson ? courseApi.getStructure(lesson.courseId) : Promise.resolve(null)),
    [lesson?.courseId]
  );
  const week = structure?.weeks.find((w) => w._id === lesson?.weekId);

  const { data: exercises, refetch: refetchExercises } = useFetch(
    () => (lesson ? lessonApi.getExercises(lesson._id) : Promise.resolve([])),
    [lesson?._id]
  );

  const { data: progress, setData: setProgress } = useFetch(
    () => (isAuthenticated && lesson ? progressApi.getForCourse(lesson.courseId) : Promise.resolve(null)),
    [lesson?.courseId, isAuthenticated]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <PageLoader label="Loading lesson..." />;
  if (error) return <div className="mx-auto max-w-4xl px-4 py-10"><ErrorState message={error} onRetry={refetch} /></div>;
  if (!lesson) return null;

  const isCompleted = progress?.completedLessons?.some((c) => String(c) === String(lesson._id));

  const handleMarkComplete = async () => {
    if (!isAuthenticated) return navigate('/login');
    setCompleting(true);
    try {
      const updated = await progressApi.markLessonComplete({
        courseId: lesson.courseId,
        lessonId: lesson._id,
        weekId: lesson.weekId,
      });
      setProgress(updated);
      toast.success('Lesson marked complete!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCompleting(false);
    }
  };

  const handleExerciseComplete = async (exerciseId) => {
    if (!isAuthenticated) return navigate('/login');
    try {
      await progressApi.markExerciseComplete({ courseId: lesson.courseId, exerciseId });
      const updated = await progressApi.getForCourse(lesson.courseId);
      setProgress(updated);
      toast.success('Exercise completed!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <LessonSidebar
        week={week}
        currentLessonId={lesson._id}
        completedLessons={progress?.completedLessons || []}
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
          {structure && (
            <Breadcrumb
              items={[
                { label: 'Courses', to: '/courses' },
                { label: structure.course.title, to: `/courses/${lesson.courseId}` },
                { label: week ? `Week ${week.weekNumber}` : '', to: week ? `/courses/${lesson.courseId}/weeks/${week._id}` : undefined },
                { label: lesson.title },
              ]}
            />
          )}

          <button
            onClick={() => setMobileNavOpen(true)}
            className="mb-4 mt-3 flex items-center gap-1.5 text-sm font-medium text-ink-500 lg:hidden"
          >
            <Menu size={16} /> Lesson menu
          </button>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-400">
            <span>Week {week?.weekNumber}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {lesson.estimatedMinutes} min</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-ink-900 sm:text-3xl">{lesson.title}</h1>
          {lesson.description && <p className="mt-2 text-ink-600">{lesson.description}</p>}

          <div className="mt-6">
            {lesson.content.length === 0 ? (
              <p className="text-ink-400 italic">This lesson has no content yet.</p>
            ) : (
              lesson.content.map((block, i) => <ContentBlock key={i} block={block} />)
            )}
          </div>

          {exercises?.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-lg font-semibold text-ink-900">Exercises</h2>
              <div className="space-y-4">
                {exercises.map((ex) => (
                  <ExerciseCard
                    key={ex._id}
                    exercise={ex}
                    completed={progress?.completedExercises?.some((c) => String(c) === String(ex._id))}
                    onComplete={handleExerciseComplete}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 flex items-center justify-between gap-3 border-t border-ink-100 pt-6">
            <button
              className="btn-secondary"
              disabled={!data.prevLessonId}
              onClick={() => navigate(`/lessons/${data.prevLessonId}`)}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <button className={isCompleted ? 'btn-secondary' : 'btn-accent'} disabled={completing || isCompleted} onClick={handleMarkComplete}>
              <CheckCircle2 size={16} /> {isCompleted ? 'Completed' : completing ? 'Saving...' : 'Mark Complete'}
            </button>

            <button
              className="btn-secondary"
              disabled={!data.nextLessonId}
              onClick={() => navigate(`/lessons/${data.nextLessonId}`)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
