import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ListTree } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import courseApi from '../../services/courseApi';
import progressApi from '../../services/progressApi';
import useAuth from '../../hooks/useAuth';
import TopicCard from '../../components/course/TopicCard.jsx';
import { PageLoader } from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function TopicsOverview() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const { data, loading, error, refetch } = useFetch(() => courseApi.getStructure(id), [id]);
  const { data: progress } = useFetch(
    () => (isAuthenticated ? progressApi.getForCourse(id) : Promise.resolve(null)),
    [id, isAuthenticated]
  );

  if (loading) return <PageLoader label="Loading topics..." />;
  if (error) return <div className="mx-auto max-w-5xl px-4 py-10"><ErrorState message={error} onRetry={refetch} /></div>;
  if (!data) return null;

  const { course, weeks } = data;

  // Flatten every topic across every week into one list, tagged with its
  // parent week so the card can still deep-link correctly.
  const allTopics = weeks.flatMap((week) => week.topics.map((topic) => ({ topic, weekId: week._id })));

  const topicPercent = (topic) => {
    if (!progress) return 0;
    const lessonIds = topic.lessons.map((l) => l._id);
    if (lessonIds.length === 0) return 0;
    const done = lessonIds.filter((lid) => progress.completedLessons?.some((c) => String(c) === String(lid))).length;
    return Math.round((done / lessonIds.length) * 100);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to={`/courses/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
        <ChevronLeft size={15} /> Back to weeks view
      </Link>

      <h1 className="text-2xl font-bold text-ink-900">All {course.category} Topics</h1>
      <p className="mt-1 text-ink-500">Every topic in {course.title}, across all weeks.</p>

      {allTopics.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={ListTree}
            title="No topics published yet"
            description="This course's content is being prepared by the admin team. Check back soon."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {allTopics.map(({ topic, weekId }, i) => (
            <TopicCard
              key={topic._id}
              topic={topic}
              courseId={id}
              weekId={weekId}
              percent={topicPercent(topic)}
              toneIndex={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
