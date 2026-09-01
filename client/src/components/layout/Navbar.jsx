import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
import Logo from './Logo.jsx';
import useAuth from '../../hooks/useAuth';

const PUBLIC_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/courses', label: 'Courses' },
];

const STUDENT_LINKS = [
  { to: '/my-learning', label: 'My Learning' },
  { to: '/progress', label: 'Progress' },
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const links = [...PUBLIC_LINKS, ...(isAuthenticated && !isAdmin ? STUDENT_LINKS : [])];

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-ink-600 hover:text-ink-900'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === '/'}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAdmin && (
            <NavLink to="/admin" className="btn-secondary">
              <LayoutDashboard size={15} /> Admin
            </NavLink>
          )}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-ink-200 py-1 pl-1 pr-3 hover:bg-ink-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="text-sm font-medium text-ink-700">{user?.name?.split(' ')[0]}</span>
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-ink-100 bg-white py-1.5 shadow-cardHover">
                    <button
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-600 hover:bg-ink-50"
                      onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                    >
                      <UserIcon size={15} /> Profile
                    </button>
                    {isAdmin && (
                      <button
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-600 hover:bg-ink-50"
                        onClick={() => { setUserMenuOpen(false); navigate('/admin'); }}
                      >
                        <ShieldCheck size={15} /> Admin Dashboard
                      </button>
                    )}
                    <button
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      onClick={() => { setUserMenuOpen(false); logout(); navigate('/'); }}
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <NavLink to="/login" className="btn-ghost">Log in</NavLink>
              <NavLink to="/register" className="btn-primary">Get Started</NavLink>
            </>
          )}
        </div>

        <button className="p-2 md:hidden" onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-ink-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setMenuOpen(false)} end={l.to === '/'}>
                {l.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className="text-sm font-medium text-brand-600" onClick={() => setMenuOpen(false)}>
                Admin Dashboard
              </NavLink>
            )}
            <div className="mt-2 flex gap-2 border-t border-ink-100 pt-4">
              {isAuthenticated ? (
                <button className="btn-secondary w-full" onClick={() => { setMenuOpen(false); logout(); navigate('/'); }}>
                  <LogOut size={15} /> Logout
                </button>
              ) : (
                <>
                  <NavLink to="/login" className="btn-secondary flex-1" onClick={() => setMenuOpen(false)}>Log in</NavLink>
                  <NavLink to="/register" className="btn-primary flex-1" onClick={() => setMenuOpen(false)}>Sign up</NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
