import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import courseApi from '../../services/courseApi';
import { getErrorMessage } from '../../services/api';
import DataTable from '../../components/admin/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { PageLoader } from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import Badge from '../../components/common/Badge.jsx';

const EMPTY_FORM = { title: '', description: '', category: 'Python', level: 'beginner' };

export default function AdminCourses() {
  const { data: courses, loading, error, refetch } = useFetch(() => courseApi.getAll(), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (course) => { setEditing(course); setForm({ title: course.title, description: course.description, category: course.category, level: course.level }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await courseApi.update(editing._id, form);
        toast.success('Course updated');
      } else {
        await courseApi.create(form);
        toast.success('Course created');
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (course) => {
    try {
      await (course.isPublished ? courseApi.unpublish(course._id) : courseApi.publish(course._id));
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    try {
      await courseApi.remove(deleteTarget._id);
      toast.success('Course deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <PageLoader label="Loading courses..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Courses</h1>
          <p className="mt-1 text-ink-500">Create and manage courses. Content comes from PDF uploads under Documents.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add Course</button>
      </div>

      <div className="mt-6">
        <DataTable
          columns={[
            { key: 'title', label: 'Title', render: (r) => (
              <div className="flex items-center gap-2"><BookOpen size={14} className="text-ink-400" /> <span className="font-medium text-ink-800">{r.title}</span></div>
            ) },
            { key: 'category', label: 'Category', render: (r) => <Badge variant="brand">{r.category}</Badge> },
            { key: 'level', label: 'Level', render: (r) => <span className="capitalize">{r.level}</span> },
            { key: 'status', label: 'Status', render: (r) => <Badge variant={r.isPublished ? 'success' : 'warning'}>{r.isPublished ? 'Published' : 'Draft'}</Badge> },
          ]}
          rows={courses}
          emptyMessage="No courses yet. Click 'Add Course' to create one."
          actions={(row) => (
            <>
              <button title="Toggle publish" className="rounded-lg p-2 text-ink-500 hover:bg-ink-100" onClick={() => togglePublish(row)}>
                {row.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button title="Edit" className="rounded-lg p-2 text-ink-500 hover:bg-ink-100" onClick={() => openEdit(row)}>
                <Pencil size={15} />
              </button>
              <button title="Delete" className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => setDeleteTarget(row)}>
                <Trash2 size={15} />
              </button>
            </>
          )}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Course' : 'Add Course'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" form="course-form" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <form id="course-form" onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <input className="input" placeholder="Python, SQL, ..." value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="label">Level</label>
              <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete course?"
        message={`This will permanently delete "${deleteTarget?.title}" and all of its weeks, topics, lessons, exercises, quizzes and questions.`}
      />
    </div>
  );
}
