import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Upload, FileText, Cog, ClipboardCheck, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import courseApi from '../../services/courseApi';
import documentApi from '../../services/documentApi';
import { getErrorMessage } from '../../services/api';
import DataTable from '../../components/admin/DataTable.jsx';
import EntitySelect from '../../components/admin/EntitySelect.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { StatusBadge } from '../../components/common/Badge.jsx';
import { PageLoader } from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';

export default function AdminDocuments() {
  const { data: courses } = useFetch(() => courseApi.getAll(), []);
  const [courseId, setCourseId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileInputRef = useRef(null);

  const { data: docs, loading, error, refetch } = useFetch(() => documentApi.getAll(), []);

  const handleUploadClick = () => {
    if (!courseId) return toast.error('Select a course first');
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      await documentApi.upload(courseId, file, setProgress);
      toast.success('PDF uploaded');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleProcess = async (doc) => {
    try {
      await documentApi.process(doc._id);
      toast.success('PDF processed — draft ready for review');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    try {
      await documentApi.remove(deleteTarget._id);
      toast.success('Document deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <PageLoader label="Loading documents..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">PDF Documents</h1>
      <p className="mt-1 text-ink-500">
        Upload the course PDF here. Nothing is published automatically — process it, then review the draft in Content Review.
      </p>

      <div className="card mt-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <EntitySelect
            label="Course"
            value={courseId}
            onChange={setCourseId}
            options={(courses || []).map((c) => ({ value: c._id, label: c.title }))}
            placeholder="Select a course to upload into"
          />
        </div>
        <button className="btn-primary" disabled={uploading} onClick={handleUploadClick}>
          <Upload size={16} /> {uploading ? `Uploading ${progress}%` : 'Upload PDF'}
        </button>
        <input ref={fileInputRef} type="file" accept="application/pdf" hidden onChange={handleFileChange} />
      </div>

      <div className="mt-6">
        <DataTable
          columns={[
            { key: 'fileName', label: 'File', render: (r) => (
              <div className="flex items-center gap-2"><FileText size={14} className="text-ink-400" /> <span className="font-medium text-ink-800">{r.fileName}</span></div>
            ) },
            { key: 'courseId', label: 'Course', render: (r) => courses?.find((c) => c._id === r.courseId)?.title || '—' },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            { key: 'uploadedBy', label: 'Uploaded By', render: (r) => r.uploadedBy?.name || '—' },
            { key: 'uploadedAt', label: 'Uploaded', render: (r) => new Date(r.uploadedAt).toLocaleDateString() },
          ]}
          rows={docs}
          emptyMessage="No PDFs uploaded yet."
          actions={(row) => (
            <>
              {row.status === 'uploaded' || row.status === 'failed' ? (
                <button title="Process PDF" className="rounded-lg p-2 text-brand-600 hover:bg-brand-50" onClick={() => handleProcess(row)}>
                  <Cog size={15} />
                </button>
              ) : null}
              {['draft', 'reviewed', 'published'].includes(row.status) && (
                <Link title="Review content" to={`/admin/content-review/${row._id}`} className="rounded-lg p-2 text-accent-700 hover:bg-accent-100">
                  <ClipboardCheck size={15} />
                </Link>
              )}
              <button title="Delete" className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => setDeleteTarget(row)}>
                <Trash2 size={15} />
              </button>
            </>
          )}
        />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete document?"
        message={`This removes "${deleteTarget?.fileName}" and its stored file. Any already-published content stays untouched.`}
      />
    </div>
  );
}
