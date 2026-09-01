import { Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2 font-extrabold text-ink-900">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-card">
        <Code2 size={17} />
      </span>
      <span className="text-lg">
        Py<span className="text-brand-500">Learn</span>
      </span>
    </Link>
  );
}
