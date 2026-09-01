import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FileText, ClipboardCheck, CalendarDays, ListTree,
  FileStack, Dumbbell, HelpCircle, MessageSquareText, Users, TrendingUp, BarChart3, Settings, X,
} from 'lucide-react';
import Logo from './Logo.jsx';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/admin/documents', label: 'PDF Documents', icon: FileText },
  { to: '/admin/content-review', label: 'Content Review', icon: ClipboardCheck },
  { to: '/admin/weeks', label: 'Weeks', icon: CalendarDays },
  { to: '/admin/topics', label: 'Topics', icon: ListTree },
  { to: '/admin/lessons', label: 'Lessons', icon: FileStack },
  { to: '/admin/exercises', label: 'Exercises', icon: Dumbbell },
  { to: '/admin/quizzes', label: 'Quizzes', icon: HelpCircle },
  { to: '/admin/questions', label: 'Questions', icon: MessageSquareText },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/progress', label: 'Progress', icon: TrendingUp },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo to="/admin" />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-6">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function AdminSidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-ink-100 bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-cardHover">
            <button onClick={onClose} className="absolute right-3 top-4 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100">
              <X size={18} />
            </button>
            <SidebarContent onNavigate={onClose} />
          </div>
        </div>
      )}
    </>
  );
}
