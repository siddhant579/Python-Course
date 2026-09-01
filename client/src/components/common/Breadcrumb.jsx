import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

// items: [{ label, to? }] - the last item (no `to`) renders as plain text (current page)
export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm text-ink-400" aria-label="Breadcrumb">
      <Link to="/" className="flex items-center gap-1 hover:text-ink-600">
        <Home size={13} />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight size={13} className="flex-shrink-0 text-ink-300" />
          {item.to ? (
            <Link to={item.to} className="hover:text-ink-600">{item.label}</Link>
          ) : (
            <span className="font-medium text-ink-700">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
