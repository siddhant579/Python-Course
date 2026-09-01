import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../common/Badge.jsx';

function statusFor(week, completedWeeks, completedTopics) {
  if (completedWeeks?.some((id) => String(id) === String(week._id))) return 'completed';
  const anyTopicDone = week.topics?.some((t) => completedTopics?.some((id) => String(id) === String(t._id)));
  return anyTopicDone ? 'in-progress' : 'not-started';
}

// Clean, scannable "course curriculum" list - one row per week, matching a
// standard syllabus-table layout used across course platforms. Easier to
// scan than a card grid once a course has more than a handful of weeks.
export default function CurriculumTable({ courseId, weeks, completedWeeks = [], completedTopics = [], percentFor }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
      {weeks.map((week, i) => {
        const status = statusFor(week, completedWeeks, completedTopics);
        const percent = percentFor(week);
        return (
          <Link
            key={week._id}
            to={`/courses/${courseId}/weeks/${week._id}`}
            className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-brand-50/50 ${i > 0 ? 'border-t border-ink-100' : ''}`}
          >
            <span className="w-16 flex-shrink-0 text-xs font-bold uppercase tracking-wide text-brand-600">
              Week {week.weekNumber}
            </span>

            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink-900">{week.title}</p>
              <p className="mt-0.5 text-xs text-ink-400">
                {week.topicCount ?? week.topics?.length ?? 0} topics · {week.lessonCount ?? 0} lessons
                {week.quizCount > 0 && ` · ${week.quizCount} quiz${week.quizCount === 1 ? '' : 'zes'}`}
              </p>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              {status === 'completed' && <CheckCircle2 size={15} className="text-emerald-500" />}
              <StatusBadge status={status} />
            </div>

            <span className="hidden w-10 flex-shrink-0 text-right text-xs font-semibold text-ink-500 sm:block">
              {percent}%
            </span>

            <ChevronRight size={16} className="flex-shrink-0 text-ink-300" />
          </Link>
        );
      })}
    </div>
  );
}
