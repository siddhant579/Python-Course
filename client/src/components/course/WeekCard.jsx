import { Link } from 'react-router-dom';
import { BookOpen, FileStack, Dumbbell, HelpCircle, ChevronRight } from 'lucide-react';
import ProgressBar from '../common/ProgressBar.jsx';
import { StatusBadge } from '../common/Badge.jsx';

function statFor(week, completedWeeks, completedTopics) {
  if (completedWeeks?.some((id) => String(id) === String(week._id))) return 'completed';
  const anyTopicDone = week.topics?.some((t) => completedTopics?.some((id) => String(id) === String(t._id)));
  return anyTopicDone ? 'in-progress' : 'not-started';
}

export default function WeekCard({ courseId, week, completedWeeks = [], completedTopics = [], percent = 0 }) {
  const status = statFor(week, completedWeeks, completedTopics);

  return (
    <Link
      to={`/courses/${courseId}/weeks/${week._id}`}
      className="card group flex flex-col gap-4 p-5 transition-shadow hover:shadow-cardHover"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">Week {week.weekNumber}</span>
          <h3 className="mt-0.5 text-base font-semibold text-ink-900">{week.title}</h3>
        </div>
        <StatusBadge status={status} />
      </div>

      {week.description && <p className="line-clamp-2 text-sm text-ink-500">{week.description}</p>}

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-500">
        <span className="flex items-center gap-1"><BookOpen size={13} /> {week.topicCount ?? week.topics?.length ?? 0} topics</span>
        <span className="flex items-center gap-1"><FileStack size={13} /> {week.lessonCount ?? 0} lessons</span>
        <span className="flex items-center gap-1"><Dumbbell size={13} /> {week.exerciseCount ?? 0} exercises</span>
        <span className="flex items-center gap-1"><HelpCircle size={13} /> {week.quizCount ?? week.quizzes?.length ?? 0} quizzes</span>
      </div>

      <ProgressBar percent={percent} size="sm" />

      <span className="flex items-center gap-1 text-sm font-medium text-brand-600 group-hover:gap-2 transition-all">
        {status === 'not-started' ? 'Start week' : 'Continue'} <ChevronRight size={15} />
      </span>
    </Link>
  );
}
