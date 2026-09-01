import { Link } from 'react-router-dom';
import getTopicIcon from '../../utils/topicIcon';
import CircularProgress from '../common/CircularProgress.jsx';

const TONES = [
  { icon: 'text-brand-600', ring: 'text-brand-500' },
  { icon: 'text-accent-600', ring: 'text-accent-500' },
  { icon: 'text-emerald-600', ring: 'text-emerald-500' },
  { icon: 'text-violet-600', ring: 'text-violet-500' },
];

// Brilliant.org-style flat topic card: a circular progress ring around the
// icon (that platform's signature visual) instead of a bar underneath -
// deliberately content-agnostic so it renders correctly whether a topic
// has 0 or 200 lessons behind it.
export default function TopicCard({ topic, courseId, weekId, percent = 0, toneIndex = 0 }) {
  const Icon = getTopicIcon(topic.title);
  const tone = TONES[toneIndex % TONES.length];
  const exerciseCount = topic.lessons?.reduce((sum, l) => sum + (l.exerciseCount || 0), 0) || 0;

  return (
    <Link
      to={`/courses/${courseId}/weeks/${weekId}`}
      className="card group flex items-center gap-4 p-5 transition-shadow hover:shadow-cardHover"
    >
      <CircularProgress percent={percent} size={52} strokeWidth={3} fillClassName={tone.ring}>
        <Icon size={20} className={tone.icon} />
      </CircularProgress>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-ink-900">{topic.title}</h3>
        {topic.description && <p className="mt-0.5 line-clamp-2 text-sm text-ink-500">{topic.description}</p>}
        <p className="mt-2 text-xs text-ink-400">
          {exerciseCount} exercise{exerciseCount === 1 ? '' : 's'} · {percent}% complete
        </p>
      </div>
    </Link>
  );
}
