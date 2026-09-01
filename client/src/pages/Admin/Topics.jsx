import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff, ListTree } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import courseApi from '../../services/courseApi';
import { getErrorMessage } from '../../services/api';
import EntitySelect from '../../components/admin/EntitySelect.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import Badge from '../../components/common/Badge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const EMPTY_FORM = { title: '', description: '', order: 0 };

export default function AdminTopics() {
  const { data: courses } = useFetch(() => courseApi.getAll(), []);
  const [courseId, setCourseId] = useState(null);
  const [weekId, setWeekId] = useState(null);

  const { data: weeks } = useFetch(() => (courseId ? courseApi.getWeeks(courseId) : Promise.resolve([])), [courseId]);
  const { data: topics, loading, refetch } = useFetch(() => (weekId ? courseApi.getTopics(weekId) : Promise.resolve([])), [weekId]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM, order: topics?.length || 0 }); setModalOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ title: t.title, description: t.description, order: t.order }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await courseApi.updateTopic(editing._id, form);
      else await courseApi.createTopic({ ...form, weekId, courseId });
      toast.success('Topic saved');
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (t) => {
    try {
      await (t.isPublished ? courseApi.unpublishTopic(t._id) : courseApi.publishTopic(t._id));
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    try {
      await courseApi.removeTopic(deleteTarget._id);
      toast.success('Topic deleted');
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
          <h1 className="text-2xl font-bold text-ink-900">Topics</h1>
          <p className="mt-1 text-ink-500">Manage topics within a week.</p>
        </div>
        <button className="btn-primary" disabled={!weekId} onClick={openCreate}><Plus size={16} /> Add Topic</button>
      </div>

      <div className="card mt-6 grid max-w-xl gap-4 p-5 sm:grid-cols-2">
        <EntitySelect label="Course" value={courseId} onChange={(v) => { setCourseId(v); setWeekId(null); }} options={(courses || []).map((c) => ({ value: c._id, label: c.title }))} />
        <EntitySelect label="Week" value={weekId} onChange={setWeekId} options={(weeks || []).map((w) => ({ value: w._id, label: `Week ${w.weekNumber}: ${w.title}` }))} disabled={!courseId} />
      </div>

      <div className="mt-6">
        {!weekId ? (
          <EmptyState icon={ListTree} title="Select a week" description="Choose a course and week above to manage its topics." />
        ) : loading ? null : (
          <DataTable
            columns={[
              { key: 'order', label: '#' },
              { key: 'title', label: 'Title', render: (r) => <span className="font-medium text-ink-800">{r.title}</span> },
              { key: 'status', label: 'Status', render: (r) => <Badge variant={r.isPublished ? 'success' : 'warning'}>{r.isPublished ? 'Published' : 'Draft'}</Badge> },
            ]}
            rows={topics}
            emptyMessage="No topics yet."
            actions={(row) => (
              <>
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
        title={editing ? 'Edit Topic' : 'Add Topic'}
        footer={<>
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" form="topic-form" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}
      >
        <form id="topic-form" onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Order</label>
            <input type="number" min={0} className="input" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete topic?" message={`Delete "${deleteTarget?.title}"?`} />
    </div>
  );
}
