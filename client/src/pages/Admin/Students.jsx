import toast from 'react-hot-toast';
import { Users, Ban, CheckCircle } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import adminApi from '../../services/adminApi';
import { getErrorMessage } from '../../services/api';
import DataTable from '../../components/admin/DataTable.jsx';
import Badge from '../../components/common/Badge.jsx';
import { PageLoader } from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function AdminStudents() {
  const { data: students, loading, error, refetch } = useFetch(() => adminApi.getStudents(), []);

  const toggleActive = async (student) => {
    try {
      await adminApi.setStudentActive(student._id, !student.isActive);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <PageLoader label="Loading students..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">Students</h1>
      <p className="mt-1 text-ink-500">All registered students.</p>

      <div className="mt-6">
        {(!students || students.length === 0) ? (
          <EmptyState icon={Users} title="No students yet" description="Students will appear here once they register." />
        ) : (
          <DataTable
            columns={[
              { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
              { key: 'email', label: 'Email' },
              { key: 'joined', label: 'Joined', render: (r) => new Date(r.createdAt).toLocaleDateString() },
              { key: 'lastLoginAt', label: 'Last Login', render: (r) => (r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleDateString() : 'Never') },
              { key: 'status', label: 'Status', render: (r) => <Badge variant={r.isActive ? 'success' : 'danger'}>{r.isActive ? 'Active' : 'Disabled'}</Badge> },
            ]}
            rows={students}
            actions={(row) => (
              <button
                className={`rounded-lg p-2 ${row.isActive ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                onClick={() => toggleActive(row)}
                title={row.isActive ? 'Disable account' : 'Activate account'}
              >
                {row.isActive ? <Ban size={15} /> : <CheckCircle size={15} />}
              </button>
            )}
          />
        )}
      </div>
    </div>
  );
}
