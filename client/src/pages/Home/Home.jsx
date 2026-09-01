import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Trophy, Code2, CheckCircle2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import CodeBlock from '../../components/lesson/CodeBlock.jsx';

const FEATURES = [
  { icon: CalendarDays, title: 'Week-by-week structure', desc: 'Content organized into weeks, topics and lessons that build on each other.' },
  { icon: Code2, title: 'Real Python examples', desc: 'Every lesson pairs explanations with runnable, syntax-highlighted code.' },
  { icon: CheckCircle2, title: 'Hands-on exercises', desc: 'Practice what you learn with guided exercises and instant feedback.' },
  { icon: Trophy, title: 'Quizzes & progress', desc: 'Check your understanding with quizzes and track progress automatically.' },
];

const SAMPLE_CODE = `def greet(name):
    """Return a friendly greeting."""
    return f"Hello, {name}! Welcome to PyLearn."

print(greet("World"))`;

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div>
            <span className="badge bg-accent-100 text-accent-800">🐍 Learn Python the structured way</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl">
              Master Python, <span className="text-brand-500">one week at a time</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-ink-600">
              A course platform built around real material — weeks, topics, lessons, exercises and quizzes,
              all tracked as you go.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={isAuthenticated ? '/my-learning' : '/register'} className="btn-primary text-base">
                {isAuthenticated ? 'Continue Learning' : 'Get Started Free'} <ArrowRight size={17} />
              </Link>
              <Link to="/courses" className="btn-secondary text-base">Browse Courses</Link>
            </div>
          </div>
          <CodeBlock code={SAMPLE_CODE} caption="example.py" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">Everything you need to actually learn</h2>
          <p className="mt-2 text-ink-500">A complete path from first line of code to confident Python developer.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                <Icon size={20} />
              </div>
              <h3 className="mt-4 font-semibold text-ink-800">{title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink-900">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to start coding?</h2>
          <p className="mt-2 text-ink-300">Create a free account and jump into the course.</p>
          <Link to={isAuthenticated ? '/my-learning' : '/register'} className="btn-accent mt-6 inline-flex text-base">
            {isAuthenticated ? 'Go to My Learning' : 'Create Free Account'} <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}
