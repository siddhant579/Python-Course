import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import Badge from '../common/Badge.jsx';

export default function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course._id}`} className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-cardHover">
      <div className="flex h-36 items-center justify-center bg-gradient-to-br from-brand-500 to-brand-800 text-white">
        {course.coverImageUrl ? (
          <img src={course.coverImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <BookOpen size={36} className="opacity-80" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <Badge variant="brand">{course.category}</Badge>
          <Badge variant="neutral">{course.level}</Badge>
        </div>
        <h3 className="mt-3 text-base font-semibold text-ink-900">{course.title}</h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-ink-500">{course.description}</p>
        <span className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-600 group-hover:gap-2 transition-all">
          View course <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}
