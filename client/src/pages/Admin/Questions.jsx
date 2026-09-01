import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, MessageSquareText } from 'lucide-react';
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

const EMPTY_FORM = { type: 'mcq', text: '', options: 'Option A\nOption B\nOption C\nOption D', starterCode: '', hints: '', correctAnswer: '', explanation: '', points: 1, order: 0 };

export default function AdminQuestions() {
  const [searchParams] = useSearchParams();
  const presetQuizId = searchParams.get('quizId');

  const { data: courses } = useFetch(() => courseApi.getAll(), []);
  const [courseId, setCourseId] = useState(null);
  const [weekId, setWeekId] = useState(null);
  const [quizId, setQuizId] = useState(presetQuizId || null);

  const { data: weeks } = useFetch(() => (courseId ? courseApi.getWeeks(courseId) : Promise.resolve([])), [courseId]);
  const { data: quizzes } = useFetch(() => (weekId ? quizApi.getByWeek(weekId) : Promise.resolve([])), [weekId]);
  const { data: questions, loading, refetch } = useFetch(() => (quizId ? quizApi.getQuestions(quizId) : Promise.resolve([])), [quizId]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (presetQuizId) setQuizId(presetQuizId);
  }, [presetQuizId]);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM, order: questions?.length || 0 }); setModalOpen(true); };
  const openEdit = (q) => {
    setEditing(q);
    setForm({
      type: q.type,
      text: q.text,
      options: (q.options || []).join('\n'),
      starterCode: q.starterCode || '',
      hints: (q.hints || []).join('\n'),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      points: q.points,
      order: q.order,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        options: form.type === 'mcq' ? form.options.split('\n').map((o) => o.trim()).filter(Boolean) : [],
        hints: form.type === 'code' ? form.hints.split('\n').map((h) => h.trim()).filter(Boolean) : [],
        starterCode: form.type === 'code' ? form.starterCode : '',
      };
      if (editing) await quizApi.updateQuestion(editing._id, payload);
      else await quizApi.createQuestion({ ...payload, quizId });
      toast.success('Question saved');
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await quizApi.removeQuestion(deleteTarget._id);
      toast.success('Question deleted');
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
          <h1 className="text-2xl font-bold text-ink-900">Questions</h1>
          <p className="mt-1 text-ink-500">Manage quiz questions, answers and explanations.</p>
        </div>
        <button className="btn-primary" disabled={!quizId} onClick={openCreate}><Plus size={16} /> Add Question</button>
      </div>

      <div className="card mt-6 grid max-w-4xl gap-4 p-5 sm:grid-cols-3">
        <EntitySelect label="Course" value={courseId} onChange={(v) => { setCourseId(v); setWeekId(null); setQuizId(null); }} options={(courses || []).map((c) => ({ value: c._id, label: c.title }))} />
        <EntitySelect label="Week" value={weekId} onChange={(v) => { setWeekId(v); setQuizId(null); }} options={(weeks || []).map((w) => ({ value: w._id, label: `Week ${w.weekNumber}` }))} disabled={!courseId} />
        <EntitySelect label="Quiz" value={quizId} onChange={setQuizId} options={(quizzes || []).map((q) => ({ value: q._id, label: q.title }))} disabled={!weekId} />
      </div>

      <div className="mt-6">
        {!quizId ? (
          <EmptyState icon={MessageSquareText} title="Select a quiz" description="Choose a course, week and quiz above (or open this page from Quizzes) to manage its questions." />
        ) : loading ? null : (
          <DataTable
            columns={[
              { key: 'text', label: 'Question', render: (r) => <span className="font-medium text-ink-800">{r.text}</span> },
              { key: 'type', label: 'Type', render: (r) => <Badge variant="neutral">{r.type}</Badge> },
              { key: 'correctAnswer', label: 'Answer' },
              { key: 'points', label: 'Points' },
            ]}
            rows={questions}
            emptyMessage="No questions yet."
            actions={(row) => (
              <>
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
        title={editing ? 'Edit Question' : 'Add Question'}
        size="lg"
        footer={<>
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" form="question-form" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}
      >
        <form id="question-form" onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="mcq">Multiple Choice</option>
                <option value="truefalse">True / False</option>
                <option value="short">Short Answer</option>
                <option value="code">Code Writing (runs in-browser)</option>
              </select>
            </div>
            <div>
              <label className="label">Points</label>
              <input type="number" min={1} className="input" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="label">Question Text</label>
            <textarea rows={2} required className="input" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
          </div>
          {form.type === 'mcq' && (
            <div>
              <label className="label">Options (one per line)</label>
              <textarea rows={4} className="input" value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} />
            </div>
          )}
          {form.type === 'code' && (
            <>
              <div>
                <label className="label">Starter Code</label>
                <textarea rows={4} className="input font-mono text-xs" placeholder="def solve():\n    pass" value={form.starterCode} onChange={(e) => setForm({ ...form, starterCode: e.target.value })} />
              </div>
              <div>
                <label className="label">Hints (one per line)</label>
                <textarea rows={2} className="input" value={form.hints} onChange={(e) => setForm({ ...form, hints: e.target.value })} />
              </div>
            </>
          )}
          <div>
            <label className="label">
              {form.type === 'code' ? 'Expected Output (exact stdout the code should print)' : `Correct Answer ${form.type === 'truefalse' ? '(true or false)' : ''}`}
            </label>
            <input required className="input" value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} placeholder={form.type === 'mcq' ? 'Must exactly match one option' : ''} />
          </div>
          <div>
            <label className="label">Explanation</label>
            <textarea rows={2} className="input" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete question?" message="Delete this question?" />
    </div>
  );
}
