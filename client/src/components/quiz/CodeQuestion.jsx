import { useState } from 'react';
import { Play, Loader2, Lightbulb, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import { runPython } from '../../utils/pyodideRunner';
import PythonOutput from '../lesson/PythonOutput.jsx';

// A "write code, run it, output becomes your answer" quiz question. Runs
// entirely client-side via Pyodide - the captured stdout is what gets
// submitted and graded (same string-compare grading every other question
// type uses), so no code ever executes on the server.
export default function CodeQuestion({ question, value, onChange, review }) {
  const [code, setCode] = useState(question.starterCode || '');
  const [status, setStatus] = useState('idle');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [showHints, setShowHints] = useState(false);

  const isCorrect = review && String(value || '').trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();

  const handleRun = async () => {
    setStatus('loading');
    const result = await runPython(code);
    setOutput(result.output);
    setError(result.error);
    setStatus(result.error ? 'error' : 'done');
    if (!result.error) onChange(result.output);
  };

  if (review) {
    return (
      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">Your output</p>
          <pre className="overflow-x-auto rounded-lg bg-ink-950 p-3 font-mono text-xs text-emerald-300">{value || '(no output submitted)'}</pre>
        </div>
        {!isCorrect && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">Expected output</p>
            <pre className="overflow-x-auto rounded-lg bg-ink-950 p-3 font-mono text-xs text-emerald-300">{question.correctAnswer}</pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4">
      {question.hints?.length > 0 && (
        <button
          type="button"
          onClick={() => setShowHints((v) => !v)}
          className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <Lightbulb size={14} /> {showHints ? 'Hide hints' : `Show hints (${question.hints.length})`}
          <ChevronDown size={13} className={`transition-transform ${showHints ? 'rotate-180' : ''}`} />
        </button>
      )}
      {showHints && (
        <ul className="mb-3 space-y-1 rounded-lg bg-ink-50 p-3 text-sm text-ink-600">
          {question.hints.map((h, i) => <li key={i}>💡 {h}</li>)}
        </ul>
      )}

      <div className="overflow-hidden rounded-xl border border-ink-800 bg-ink-950">
        <div className="flex items-center justify-between border-b border-ink-800/80 bg-ink-900 px-3 py-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Python</span>
          <div className="flex items-center gap-2">
            {value && <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400"><CheckCircle2 size={12} /> Answer captured</span>}
            <button
              type="button"
              onClick={handleRun}
              disabled={status === 'loading'}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-emerald-400 hover:bg-ink-800 disabled:opacity-60"
            >
              {status === 'loading' ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
              Run
            </button>
          </div>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          rows={Math.min(Math.max(code.split('\n').length, 3), 12)}
          className="w-full resize-y bg-transparent px-3 py-2 font-mono text-[13px] leading-6 text-ink-100 outline-none"
        />
        <PythonOutput status={status} output={output} error={error} />
      </div>
      {!value && <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-600"><XCircle size={12} /> Run your code at least once - its output becomes your answer.</p>}
    </div>
  );
}
