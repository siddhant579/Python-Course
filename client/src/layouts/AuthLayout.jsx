import { Outlet } from 'react-router-dom';
import { Code2 } from 'lucide-react';
import Logo from '../components/layout/Logo.jsx';

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Logo />
          <div className="mt-10">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-900 lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative z-10 max-w-md px-10 text-center text-white">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <Code2 size={30} />
          </div>
          <h2 className="text-2xl font-bold">Learn Python, one week at a time</h2>
          <p className="mt-3 text-brand-100">
            Structured lessons, hands-on exercises and quizzes built from real course material — track your progress every step of the way.
          </p>
        </div>
      </div>
    </div>
  );
}
