import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ClipboardCheck, Plus, Trash2, CheckCircle2, FileText } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import documentApi from '../../services/documentApi';
import { getErrorMessage } from '../../services/api';
import { StatusBadge } from '../../components/common/Badge.jsx';
import { PageLoader } from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

function EditableTopic({ topic, onChange, onRemove }) {
  return (
    <div className="rounded-lg border border-ink-200 p-4">
      <div className="flex items-center gap-2">
        <input
          className="input flex-1 font-medium"
          value={topic.title}
          onChange={(e) => onChange({ ...topic, title: e.target.value })}
        />
        <button className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={onRemove}>
          <Trash2 size={15} />
        </button>
      </div>
      <textarea
        rows={4}
        className="input mt-2 font-mono text-xs"
        value={(topic.contentLines || []).join('\n')}
        onChange={(e) => onChange({ ...topic, contentLines: e.target.value.split('\n') })}
        placeholder="Lesson content, one idea per line (copied from the PDF)"
      />
    </div>
  );
}

function EditableWeek({ week, onChange, onRemove }) {
  const updateTopic = (idx, next) => {
    const topics = [...week.topics];
    topics[idx] = next;
    onChange({ ...week, topics });
  };
  const removeTopic = (idx) => onChange({ ...week, topics: week.topics.filter((_, i) => i !== idx) });
  const addTopic = () => onChange({ ...week, topics: [...(week.topics || []), { title: 'New Topic', contentLines: [] }] });

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-500 flex-shrink-0">Week {week.weekNumber}</span>
        <input className="input flex-1 font-semibold" value={week.title} onChange={(e) => onChange({ ...week, title: e.target.value })} />
        <button className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={onRemove}>
          <Trash2 size={15} />
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {(week.topics || []).map((t, i) => (
          <EditableTopic key={i} topic={t} onChange={(next) => updateTopic(i, next)} onRemove={() => removeTopic(i)} />
        ))}
      </div>
      <button className="btn-ghost mt-3 text-sm" onClick={addTopic}><Plus size={14} /> Add topic</button>
    </div>
  );
}

function DocumentList() {
  const { data: docs, loading, error, refetch } = useFetch(() => documentApi.getAll(), []);
  if (loading) return <PageLoader label="Loading documents..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const reviewable = (docs || []).filter((d) => ['draft', 'reviewed', 'published'].includes(d.status));

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">Content Review</h1>
      <p className="mt-1 text-ink-500">Review and edit draft structures extracted from uploaded PDFs before publishing.</p>

      {reviewable.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={ClipboardCheck}
            title="Nothing to review yet"
            description="Upload and process a PDF under PDF Documents first."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {reviewable.map((doc) => (
            <Link key={doc._id} to={`/admin/content-review/${doc._id}`} className="card flex items-center justify-between p-4 hover:shadow-cardHover">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-ink-400" />
                <div>
                  <p className="font-medium text-ink-800">{doc.fileName}</p>
                  <p className="text-xs text-ink-400">{doc.draftStructure?.weeks?.length || 0} weeks detected</p>
                </div>
              </div>
              <StatusBadge status={doc.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentReviewer({ docId }) {
  const navigate = useNavigate();
  const { data: doc, loading, error, refetch } = useFetch(() => documentApi.getOne(docId), [docId]);
  const [weeks, setWeeks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (doc?.draftStructure?.weeks) setWeeks(doc.draftStructure.weeks);
  }, [doc]);

  if (loading) return <PageLoader label="Loading draft..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!doc) return null;

  const updateWeek = (idx, next) => setWeeks((w) => w.map((wk, i) => (i === idx ? next : wk)));
  const removeWeek = (idx) => setWeeks((w) => w.filter((_, i) => i !== idx));
  const addWeek = () => setWeeks((w) => [...w, { weekNumber: w.length + 1, title: `Week ${w.length + 1}`, topics: [] }]);

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await documentApi.updateDraft(docId, { ...doc.draftStructure, weeks });
      toast.success('Draft saved for review');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await documentApi.publish(docId);
      toast.success('Published! Weeks/topics/lessons were created (unpublished) — publish each in their admin pages.');
      navigate('/admin/weeks');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{doc.fileName}</h1>
          <p className="mt-1 text-ink-500">Edit the extracted draft, then mark it reviewed and publish.</p>
        </div>
        <StatusBadge status={doc.status} />
      </div>

      <div className="mt-6 space-y-4">
        {weeks.map((week, i) => (
          <EditableWeek key={i} week={week} onChange={(next) => updateWeek(i, next)} onRemove={() => removeWeek(i)} />
        ))}
        <button className="btn-secondary" onClick={addWeek}><Plus size={15} /> Add week</button>
      </div>

      <div className="sticky bottom-4 mt-8 flex items-center justify-end gap-3 rounded-xl border border-ink-100 bg-white/95 px-5 py-4 shadow-cardHover backdrop-blur">
        <button className="btn-secondary" disabled={saving} onClick={handleSaveDraft}>
          {saving ? 'Saving...' : 'Save as Reviewed'}
        </button>
        <button className="btn-primary" disabled={doc.status !== 'reviewed' || publishing} onClick={handlePublish} title={doc.status !== 'reviewed' ? 'Save as reviewed first' : ''}>
          <CheckCircle2 size={15} /> {publishing ? 'Publishing...' : 'Publish to Course'}
        </button>
      </div>
    </div>
  );
}

export default function ContentReview() {
  const { docId } = useParams();
  return docId ? <DocumentReviewer docId={docId} /> : <DocumentList />;
}
