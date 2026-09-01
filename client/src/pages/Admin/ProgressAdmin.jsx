import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import adminApi from '../../services/adminApi';
import EntitySelect from '../../components/admin/EntitySelect.jsx';
import ProgressBar from '../../components/common/ProgressBar.jsx';
import { PageLoader } from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function ProgressAdmin() {
  const { data: students } = useFetch(() => adminApi.getStudents(), []);
  const [studentId, setStudentId] = useState(null);

  const { data, loading, error, refetch } = useFetch(
    () => (studentId ? adminApi.getStudentProgress(studentId) : Promise.resolve(null)),
    [studentId]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">Student Progress</h1>
      <p className="mt-1 text-ink-500">Inspect an individual student's progress across courses.</p>

      <div className="card mt-6 max-w-sm p-5">
        <EntitySelect label="Student" value={studentId} onChange={setStudentId} options={(students || []).map((s) => ({ value: s._id, label: `${s.name} (${s.email})` }))} />
      </div>

      <div className="mt-6">
        {!studentId ? (
          <EmptyState icon={TrendingUp} title="Select a student" description="Choose a student above to view their progress." />
        ) : loading ? (
          <PageLoader />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : data?.progress?.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No progress recorded" description="This student hasn't started any course yet." />
        ) : (
          <div className="space-y-4">
            {data?.progress.map((p) => (
              <div key={p._id} className="card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-ink-800">{p.courseId?.title || 'Untitled course'}</h3>
                  <span className="text-sm font-semibold text-brand-600">{p.overallPercent}%</span>
                </div>
                <div className="mt-3"><ProgressBar percent={p.overallPercent} size="sm" /></div>
                <div className="mt-3 flex gap-4 text-xs text-ink-500">
                  <span>{p.completedLessons?.length || 0} lessons</span>
                  <span>{p.completedExercises?.length || 0} exercises</span>
                  <span>{p.completedWeeks?.length || 0} weeks</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
