import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff, Dumbbell } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import courseApi from '../../services/courseApi';
import lessonApi from '../../services/lessonApi';
import { getErrorMessage } from '../../services/api';
import EntitySelect from '../../components/admin/EntitySelect.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import Badge from '../../components/common/Badge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const EMPTY_FORM = { title: '', instructions: '', starterCode: '', hints: '', expectedOutput: '', difficulty: 'easy', order: 0 };

export default function AdminExercises() {
  const { data: courses } = useFetch(() => courseApi.getAll(), []);
  const [courseId, setCourseId] = useState(null);
  const [weekId, setWeekId] = useState(null);
  const [topicId, setTopicId] = useState(null);
  const [lessonId, setLessonId] = useState(null);

  const { data: weeks } = useFetch(() => (courseId ? courseApi.getWeeks(courseId) : Promise.resolve([])), [courseId]);
  const { data: topics } = useFetch(() => (weekId ? courseApi.getTopics(weekId) : Promise.resolve([])), [weekId]);
  const { data: lessons } = useFetch(() => (topicId ? lessonApi.getByTopic(topicId) : Promise.resolve([])), [topicId]);
  const { data: exercises, loading, refetch } = useFetch(() => (lessonId ? lessonApi.getExercises(lessonId) : Promise.resolve([])), [lessonId]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM, order: exercises?.length || 0 }); setModalOpen(true); };
  const openEdit = (ex) => {
    setEditing(ex);
    setForm({ title: ex.title, instructions: ex.instructions, starterCode: ex.starterCode, hints: (ex.hints || []).join('\n'), expectedOutput: ex.expectedOutput, difficulty: ex.difficulty, order: ex.order });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, hints: form.hints.split('\n').map((h) => h.trim()).filter(Boolean) };
      if (editing) await lessonApi.updateExercise(editing._id, payload);
      else await lessonApi.createExercise({ ...payload, lessonId, courseId });
      toast.success('Exercise saved');
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (ex) => {
    try {
      await (ex.isPublished ? lessonApi.unpublishExercise(ex._id) : lessonApi.publishExercise(ex._id));
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    try {
      await lessonApi.removeExercise(deleteTarget._id);
      toast.success('Exercise deleted');
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
          <h1 className="text-2xl font-bold text-ink-900">Exercises</h1>
          <p className="mt-1 text-ink-500">Manage practice exercises attached to a lesson.</p>
        </div>
        <button className="btn-primary" disabled={!lessonId} onClick={openCreate}><Plus size={16} /> Add Exercise</button>
      </div>

      <div className="card mt-6 grid max-w-4xl gap-4 p-5 sm:grid-cols-4">
        <EntitySelect label="Course" value={courseId} onChange={(v) => { setCourseId(v); setWeekId(null); setTopicId(null); setLessonId(null); }} options={(courses || []).map((c) => ({ value: c._id, label: c.title }))} />
        <EntitySelect label="Week" value={weekId} onChange={(v) => { setWeekId(v); setTopicId(null); setLessonId(null); }} options={(weeks || []).map((w) => ({ value: w._id, label: `Week ${w.weekNumber}` }))} disabled={!courseId} />
        <EntitySelect label="Topic" value={topicId} onChange={(v) => { setTopicId(v); setLessonId(null); }} options={(topics || []).map((t) => ({ value: t._id, label: t.title }))} disabled={!weekId} />
        <EntitySelect label="Lesson" value={lessonId} onChange={setLessonId} options={(lessons || []).map((l) => ({ value: l._id, label: l.title }))} disabled={!topicId} />
      </div>

      <div className="mt-6">
        {!lessonId ? (
          <EmptyState icon={Dumbbell} title="Select a lesson" description="Choose a course, week, topic and lesson above to manage its exercises." />
        ) : loading ? null : (
          <DataTable
            columns={[
              { key: 'title', label: 'Title', render: (r) => <span className="font-medium text-ink-800">{r.title}</span> },
              { key: 'difficulty', label: 'Difficulty', render: (r) => <span className="capitalize">{r.difficulty}</span> },
              { key: 'status', label: 'Status', render: (r) => <Badge variant={r.isPublished ? 'success' : 'warning'}>{r.isPublished ? 'Published' : 'Draft'}</Badge> },
            ]}
            rows={exercises}
            emptyMessage="No exercises yet."
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
        title={editing ? 'Edit Exercise' : 'Add Exercise'}
        size="lg"
        footer={<>
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" form="exercise-form" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}
      >
        <form id="exercise-form" onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Instructions</label>
            <textarea rows={3} required className="input" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
          </div>
          <div>
            <label className="label">Starter Code</label>
            <textarea rows={3} className="input font-mono text-xs" value={form.starterCode} onChange={(e) => setForm({ ...form, starterCode: e.target.value })} />
          </div>
          <div>
            <label className="label">Hints (one per line)</label>
            <textarea rows={2} className="input" value={form.hints} onChange={(e) => setForm({ ...form, hints: e.target.value })} />
          </div>
          <div>
            <label className="label">Expected Output</label>
            <textarea rows={2} className="input font-mono text-xs" value={form.expectedOutput} onChange={(e) => setForm({ ...form, expectedOutput: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Difficulty</label>
              <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="label">Order</label>
              <input type="number" min={0} className="input" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete exercise?" message={`Delete "${deleteTarget?.title}"?`} />
    </div>
  );
}
