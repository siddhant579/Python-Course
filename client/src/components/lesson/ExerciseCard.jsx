import { useState } from 'react';
import { Dumbbell, Lightbulb, CheckCircle2, ChevronDown, Terminal } from 'lucide-react';
import CodeEditor from './CodeEditor.jsx';

const DIFFICULTY_COLOR = { easy: 'text-emerald-600 bg-emerald-50', medium: 'text-amber-600 bg-amber-50', hard: 'text-red-600 bg-red-50' };

export default function ExerciseCard({ exercise, completed, onComplete }) {
  const [showHints, setShowHints] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
            <Dumbbell size={16} />
          </div>
          <div>
            <h4 className="font-semibold text-ink-800">{exercise.title}</h4>
            <span className={`badge mt-0.5 ${DIFFICULTY_COLOR[exercise.difficulty] || DIFFICULTY_COLOR.easy}`}>
              {exercise.difficulty}
            </span>
          </div>
        </div>
        {completed && (
          <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
            <CheckCircle2 size={16} /> Done
          </span>
        )}
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-ink-600">{exercise.instructions}</p>

      {exercise.starterCode && <CodeEditor starterCode={exercise.starterCode} caption="edit and run your solution" />}

      {exercise.hints?.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowHints((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <Lightbulb size={15} /> {showHints ? 'Hide hints' : `Show hints (${exercise.hints.length})`}
            <ChevronDown size={14} className={`transition-transform ${showHints ? 'rotate-180' : ''}`} />
          </button>
          {showHints && (
            <ul className="mt-2 space-y-1.5 rounded-lg bg-ink-50 p-3 text-sm text-ink-600">
              {exercise.hints.map((h, i) => <li key={i}>💡 {h}</li>)}
            </ul>
          )}
        </div>
      )}

      {exercise.expectedOutput && (
        <div className="mt-3">
          <button
            onClick={() => setShowOutput((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <Terminal size={15} /> {showOutput ? 'Hide expected output' : 'Show expected output'}
            <ChevronDown size={14} className={`transition-transform ${showOutput ? 'rotate-180' : ''}`} />
          </button>
          {showOutput && (
            <pre className="mt-2 overflow-x-auto rounded-lg bg-ink-950 p-3 font-mono text-xs text-emerald-300">
              {exercise.expectedOutput}
            </pre>
          )}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          className={completed ? 'btn-secondary' : 'btn-primary'}
          disabled={completed}
          onClick={() => onComplete(exercise._id)}
        >
          <CheckCircle2 size={15} /> {completed ? 'Completed' : 'Mark as complete'}
        </button>
      </div>
    </div>
  );
}
