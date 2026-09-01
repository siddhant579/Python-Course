import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useFetch from '../../hooks/useFetch';
import adminApi from '../../services/adminApi';
import { PageLoader } from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';

export default function Analytics() {
  const { data: stats, loading, error, refetch } = useFetch(() => adminApi.getStats(), []);

  if (loading) return <PageLoader label="Loading analytics..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!stats) return null;

  const publishRatio = [
    { name: 'Courses', published: stats.publishedCourses, draft: stats.draftCourses },
    { name: 'Lessons', published: stats.publishedLessons, draft: stats.draftLessons },
  ];

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
          <BarChart3 size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Analytics</h1>
          <p className="text-sm text-ink-500">Publishing health across your content.</p>
        </div>
      </div>

      <div className="card mt-6 p-5">
        <h3 className="mb-4 font-semibold text-ink-800">Published vs. Draft</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={publishRatio}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#69738a' }} />
            <YAxis tick={{ fontSize: 12, fill: '#69738a' }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #eceef2', fontSize: 13 }} />
            <Bar dataKey="published" stackId="a" fill="#22a866" radius={[0, 0, 0, 0]} name="Published" />
            <Bar dataKey="draft" stackId="a" fill="#8266ec" radius={[6, 6, 0, 0]} name="Draft" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-ink-500">Total Students</p>
          <p className="mt-2 text-2xl font-bold text-ink-900">{stats.totalStudents}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-ink-500">Total Published Courses</p>
          <p className="mt-2 text-2xl font-bold text-ink-900">{stats.publishedCourses}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-ink-500">PDF Documents Processed</p>
          <p className="mt-2 text-2xl font-bold text-ink-900">{stats.totalDocuments}</p>
        </div>
      </div>
    </div>
  );
}
