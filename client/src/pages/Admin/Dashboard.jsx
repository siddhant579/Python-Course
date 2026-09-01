import { BookOpen, Users, CalendarDays, FileStack, Dumbbell, HelpCircle, MessageSquareText, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import useFetch from '../../hooks/useFetch';
import adminApi from '../../services/adminApi';
import StatCard from '../../components/admin/StatCard.jsx';
import { PageLoader } from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';

const PIE_COLORS = ['#22a866', '#8266ec', '#3ac97e', '#b6a8f7', '#94a3b8', '#ef4444'];

export default function Dashboard() {
  const { data: stats, loading, error, refetch } = useFetch(() => adminApi.getStats(), []);

  if (loading) return <PageLoader label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!stats) return null;

  const contentBar = [
    { name: 'Weeks', count: stats.totalWeeks },
    { name: 'Topics', count: stats.totalTopics },
    { name: 'Lessons', count: stats.totalLessons },
    { name: 'Exercises', count: stats.totalExercises },
    { name: 'Quizzes', count: stats.totalQuizzes },
    { name: 'Questions', count: stats.totalQuestions },
  ];

  const publishPie = [
    { name: 'Published Lessons', value: stats.publishedLessons },
    { name: 'Draft Lessons', value: stats.draftLessons },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">Dashboard</h1>
      <p className="mt-1 text-ink-500">Overview of your platform's content and students.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Total Courses" value={stats.totalCourses} sub={`${stats.publishedCourses} published`} />
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} tone="accent" />
        <StatCard icon={CalendarDays} label="Total Weeks" value={stats.totalWeeks} tone="success" />
        <StatCard icon={FileStack} label="Total Lessons" value={stats.totalLessons} sub={`${stats.publishedLessons} published`} tone="warning" />
        <StatCard icon={Dumbbell} label="Total Exercises" value={stats.totalExercises} />
        <StatCard icon={HelpCircle} label="Total Quizzes" value={stats.totalQuizzes} tone="accent" />
        <StatCard icon={MessageSquareText} label="Total Questions" value={stats.totalQuestions} tone="success" />
        <StatCard icon={FileText} label="PDF Documents" value={stats.totalDocuments} tone="warning" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-4 font-semibold text-ink-800">Content by type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={contentBar}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#69738a' }} />
              <YAxis tick={{ fontSize: 12, fill: '#69738a' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #eceef2', fontSize: 13 }} />
              <Bar dataKey="count" fill="#22a866" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-ink-800">Published vs Draft Lessons</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={publishPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {publishPie.map((entry, i) => <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #eceef2', fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats.documentsByStatus?.length > 0 && (
        <div className="card mt-6 p-5">
          <h3 className="mb-4 font-semibold text-ink-800">PDF documents by status</h3>
          <div className="flex flex-wrap gap-3">
            {stats.documentsByStatus.map((d) => (
              <span key={d.status} className="badge bg-ink-100 text-ink-700 capitalize">{d.status}: {d.count}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
