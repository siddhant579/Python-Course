import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import AdminSidebar from '../components/layout/AdminSidebar.jsx';
import useAuth from '../hooks/useAuth';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-ink-50">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-ink-100 bg-white px-4 sm:px-6">
          <button className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm text-ink-500">Welcome back,</p>
            <p className="text-sm font-semibold text-ink-800">{user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-ink-500 hover:bg-ink-100">
              <Bell size={18} />
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
