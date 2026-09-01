import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff, HelpCircle, MessageSquareText } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import courseApi from '../../services/courseApi';
import quizApi from '../../services/quizApi';
import { getErrorMessage } from '../../services/api';
import EntitySelect from '../../components/admin/EntitySelect.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import Badge from '../../components/common/Badge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const EMPTY_FORM = { title: '', description: '', timeLimitMinutes: 0, passPercent: 60, order: 0 };

export default function AdminQuizzes() {
  const { data: courses } = useFetch(() => courseApi.getAll(), []);
  const [courseId, setCourseId] = useState(null);
  const [weekId, setWeekId] = useState(null);

  const { data: weeks } = useFetch(() => (courseId ? courseApi.getWeeks(courseId) : Promise.resolve([])), [courseId]);
  const { data: quizzes, loading, refetch } = useFetch(() => (weekId ? quizApi.getByWeek(weekId) : Promise.resolve([])), [weekId]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM, order: quizzes?.length || 0 }); setModalOpen(true); };
  const openEdit = (q) => { setEditing(q); setForm({ title: q.title, description: q.description, timeLimitMinutes: q.timeLimitMinutes, passPercent: q.passPercent, order: q.order }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await quizApi.update(editing._id, form);
      else await quizApi.create({ ...form, weekId, courseId });
      toast.success('Quiz saved');
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (q) => {
    try {
      await (q.isPublished ? quizApi.unpublish(q._id) : quizApi.publish(q._id));
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    try {
      await quizApi.remove(deleteTarget._id);
      toast.success('Quiz deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Quizzes</h1>
          <p className="mt-1 text-ink-500">Manage quizzes attached to a week. Add questions from the Questions page.</p>
        </div>
        <button className="btn-primary" disabled={!weekId} onClick={openCreate}><Plus size={16} /> Add Quiz</button>
      </div>

      <div className="card mt-6 grid max-w-xl gap-4 p-5 sm:grid-cols-2">
        <EntitySelect label="Course" value={courseId} onChange={(v) => { setCourseId(v); setWeekId(null); }} options={(courses || []).map((c) => ({ value: c._id, label: c.title }))} />
        <EntitySelect label="Week" value={weekId} onChange={setWeekId} options={(weeks || []).map((w) => ({ value: w._id, label: `Week ${w.weekNumber}: ${w.title}` }))} disabled={!courseId} />
      </div>

      <div className="mt-6">
        {!weekId ? (
          <EmptyState icon={HelpCircle} title="Select a week" description="Choose a course and week above to manage its quizzes." />
        ) : loading ? null : (
          <DataTable
            columns={[
              { key: 'title', label: 'Title', render: (r) => <span className="font-medium text-ink-800">{r.title}</span> },
              { key: 'passPercent', label: 'Pass %' },
              { key: 'status', label: 'Status', render: (r) => <Badge variant={r.isPublished ? 'success' : 'warning'}>{r.isPublished ? 'Published' : 'Draft'}</Badge> },
            ]}
            rows={quizzes}
            emptyMessage="No quizzes yet."
            actions={(row) => (
              <>
                <Link title="Manage questions" to={`/admin/questions?quizId=${row._id}`} className="rounded-lg p-2 text-brand-600 hover:bg-brand-50">
                  <MessageSquareText size={15} />
                </Link>
                <button className="rounded-lg p-2 text-ink-500 hover:bg-ink-100" onClick={() => togglePublish(row)}>
                  {row.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button className="rounded-lg p-2 text-ink-500 hover:bg-ink-100" onClick={() => openEdit(row)}><Pencil size={15} /></button>
                <button className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => setDeleteTarget(row)}><Trash2 size={15} /></button>
              </>
            )}
          />
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Quiz' : 'Add Quiz'}
        footer={<>
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" form="quiz-form" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}
      >
        <form id="quiz-form" onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={2} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Time Limit (min, 0 = untimed)</label>
              <input type="number" min={0} className="input" value={form.timeLimitMinutes} onChange={(e) => setForm({ ...form, timeLimitMinutes: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Pass %</label>
              <input type="number" min={0} max={100} className="input" value={form.passPercent} onChange={(e) => setForm({ ...form, passPercent: Number(e.target.value) })} />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete quiz?" message={`Delete "${deleteTarget?.title}"? Its questions will remain orphaned.`} />
    </div>
  );
}
