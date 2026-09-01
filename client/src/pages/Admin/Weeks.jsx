import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import courseApi from '../../services/courseApi';
import { getErrorMessage } from '../../services/api';
import EntitySelect from '../../components/admin/EntitySelect.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import Badge from '../../components/common/Badge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { CalendarDays } from 'lucide-react';

const EMPTY_FORM = { weekNumber: 1, title: '', description: '' };

export default function AdminWeeks() {
  const { data: courses } = useFetch(() => courseApi.getAll(), []);
  const [courseId, setCourseId] = useState(null);
  const { data: weeks, loading, refetch } = useFetch(
    () => (courseId ? courseApi.getWeeks(courseId) : Promise.resolve([])),
    [courseId]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM, weekNumber: (weeks?.length || 0) + 1 }); setModalOpen(true); };
  const openEdit = (w) => { setEditing(w); setForm({ weekNumber: w.weekNumber, title: w.title, description: w.description }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await courseApi.updateWeek(editing._id, form);
      } else {
        await courseApi.createWeek({ ...form, courseId });
      }
      toast.success('Week saved');
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (w) => {
    try {
      await (w.isPublished ? courseApi.unpublishWeek(w._id) : courseApi.publishWeek(w._id));
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    try {
      await courseApi.removeWeek(deleteTarget._id);
      toast.success('Week deleted');
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
          <h1 className="text-2xl font-bold text-ink-900">Weeks</h1>
          <p className="mt-1 text-ink-500">Manage weeks within a course.</p>
        </div>
        <button className="btn-primary" disabled={!courseId} onClick={openCreate}><Plus size={16} /> Add Week</button>
      </div>

      <div className="card mt-6 max-w-sm p-5">
        <EntitySelect label="Course" value={courseId} onChange={setCourseId} options={(courses || []).map((c) => ({ value: c._id, label: c.title }))} />
      </div>

      <div className="mt-6">
        {!courseId ? (
          <EmptyState icon={CalendarDays} title="Select a course" description="Choose a course above to manage its weeks." />
        ) : loading ? null : (
          <DataTable
            columns={[
              { key: 'weekNumber', label: '#' },
              { key: 'title', label: 'Title', render: (r) => <span className="font-medium text-ink-800">{r.title}</span> },
              { key: 'status', label: 'Status', render: (r) => <Badge variant={r.isPublished ? 'success' : 'warning'}>{r.isPublished ? 'Published' : 'Draft'}</Badge> },
            ]}
            rows={weeks}
            emptyMessage="No weeks yet."
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
        title={editing ? 'Edit Week' : 'Add Week'}
        footer={<>
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" form="week-form" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}
      >
        <form id="week-form" onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Week Number</label>
            <input type="number" min={1} required className="input" value={form.weekNumber} onChange={(e) => setForm({ ...form, weekNumber: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete week?" message={`Delete "${deleteTarget?.title}"? Topics and lessons inside it will remain orphaned in the database.`} />
    </div>
  );
}
