import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, X } from 'lucide-react';

export default function LessonSidebar({ week, currentLessonId, completedLessons = [], mobileOpen, onClose }) {
  if (!week) return null;

  const isDone = (id) => completedLessons.some((c) => String(c) === String(id));

  const content = (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink-100 px-5 py-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">Week {week.weekNumber}</span>
        <h3 className="mt-0.5 font-semibold text-ink-800">{week.title}</h3>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {week.topics.map((topic) => (
          <div key={topic._id}>
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-ink-400">{topic.title}</p>
            <ul className="mt-1.5 space-y-0.5">
              {topic.lessons.map((lesson) => (
                <li key={lesson._id}>
                  <Link
                    to={`/lessons/${lesson._id}`}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      String(lesson._id) === String(currentLessonId)
                        ? 'bg-brand-50 font-medium text-brand-700'
                        : 'text-ink-600 hover:bg-ink-100'
                    }`}
                  >
                    {isDone(lesson._id) ? (
                      <CheckCircle2 size={15} className="flex-shrink-0 text-emerald-500" />
                    ) : (
                      <Circle size={15} className="flex-shrink-0 text-ink-300" />
                    )}
                    <span className="truncate">{lesson.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden w-72 flex-shrink-0 border-r border-ink-100 bg-white lg:block">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-80 bg-white shadow-cardHover">
            <button onClick={onClose} className="absolute right-3 top-4 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100">
              <X size={18} />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
