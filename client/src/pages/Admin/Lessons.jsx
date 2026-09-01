import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff, FileStack } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import courseApi from '../../services/courseApi';
import lessonApi from '../../services/lessonApi';
import { getErrorMessage } from '../../services/api';
import EntitySelect from '../../components/admin/EntitySelect.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import ContentBlockEditor from '../../components/admin/ContentBlockEditor.jsx';
import Badge from '../../components/common/Badge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const EMPTY_FORM = { title: '', description: '', estimatedMinutes: 10, order: 0, content: [] };

export default function AdminLessons() {
  const { data: courses } = useFetch(() => courseApi.getAll(), []);
  const [courseId, setCourseId] = useState(null);
  const [weekId, setWeekId] = useState(null);
  const [topicId, setTopicId] = useState(null);

  const { data: weeks } = useFetch(() => (courseId ? courseApi.getWeeks(courseId) : Promise.resolve([])), [courseId]);
  const { data: topics } = useFetch(() => (weekId ? courseApi.getTopics(weekId) : Promise.resolve([])), [weekId]);
  const { data: lessons, loading, refetch } = useFetch(() => (topicId ? lessonApi.getByTopic(topicId) : Promise.resolve([])), [topicId]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM, order: lessons?.length || 0 }); setModalOpen(true); };
  const openEdit = async (l) => {
    setEditing(l);
    const full = await lessonApi.getOne(l._id);
    setForm({ title: full.lesson.title, description: full.lesson.description, estimatedMinutes: full.lesson.estimatedMinutes, order: full.lesson.order, content: full.lesson.content || [] });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await lessonApi.update(editing._id, form);
      else await lessonApi.create({ ...form, topicId, weekId, courseId });
      toast.success('Lesson saved');
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (l) => {
    try {
      await (l.isPublished ? lessonApi.unpublish(l._id) : lessonApi.publish(l._id));
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    try {
      await lessonApi.remove(deleteTarget._id);
      toast.success('Lesson deleted');
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
          <h1 className="text-2xl font-bold text-ink-900">Lessons</h1>
          <p className="mt-1 text-ink-500">Manage lesson content, code examples and notes.</p>
        </div>
        <button className="btn-primary" disabled={!topicId} onClick={openCreate}><Plus size={16} /> Add Lesson</button>
      </div>

      <div className="card mt-6 grid max-w-3xl gap-4 p-5 sm:grid-cols-3">
        <EntitySelect label="Course" value={courseId} onChange={(v) => { setCourseId(v); setWeekId(null); setTopicId(null); }} options={(courses || []).map((c) => ({ value: c._id, label: c.title }))} />
        <EntitySelect label="Week" value={weekId} onChange={(v) => { setWeekId(v); setTopicId(null); }} options={(weeks || []).map((w) => ({ value: w._id, label: `Week ${w.weekNumber}: ${w.title}` }))} disabled={!courseId} />
        <EntitySelect label="Topic" value={topicId} onChange={setTopicId} options={(topics || []).map((t) => ({ value: t._id, label: t.title }))} disabled={!weekId} />
      </div>

      <div className="mt-6">
        {!topicId ? (
          <EmptyState icon={FileStack} title="Select a topic" description="Choose a course, week and topic above to manage its lessons." />
        ) : loading ? null : (
          <DataTable
            columns={[
              { key: 'order', label: '#' },
              { key: 'title', label: 'Title', render: (r) => <span className="font-medium text-ink-800">{r.title}</span> },
              { key: 'estimatedMinutes', label: 'Minutes' },
              { key: 'status', label: 'Status', render: (r) => <Badge variant={r.isPublished ? 'success' : 'warning'}>{r.isPublished ? 'Published' : 'Draft'}</Badge> },
            ]}
            rows={lessons}
            emptyMessage="No lessons yet."
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
        title={editing ? 'Edit Lesson' : 'Add Lesson'}
        size="xl"
        footer={<>
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" form="lesson-form" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}
      >
        <form id="lesson-form" onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="label">Title</label>
              <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Est. Minutes</label>
              <input type="number" min={1} className="input" value={form.estimatedMinutes} onChange={(e) => setForm({ ...form, estimatedMinutes: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="label">Short Description</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Content</label>
            <ContentBlockEditor blocks={form.content} onChange={(content) => setForm({ ...form, content })} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete lesson?" message={`Delete "${deleteTarget?.title}"? Its exercises will remain orphaned.`} />
    </div>
  );
}
