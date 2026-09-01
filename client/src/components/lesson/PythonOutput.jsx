import { Loader2, Terminal, AlertTriangle } from 'lucide-react';

// Shared output console used by both CodeBlock (read-only examples) and
// the exercise code editor. Renders one of: nothing yet, loading the
// Python runtime, an error, or captured stdout.
export default function PythonOutput({ status, output, error }) {
  if (status === 'idle') return null;

  return (
    <div className="border-t border-ink-800/80 bg-ink-950 px-4 py-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
        <Terminal size={11} /> Output
      </div>
      {status === 'loading' && (
        <div className="flex items-center gap-2 py-1 text-xs text-ink-400">
          <Loader2 size={13} className="animate-spin" />
          Starting the Python runtime (first run only, ~a few seconds)...
        </div>
      )}
      {status === 'done' && (
        <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-emerald-300">
          {output || '(no output)'}
        </pre>
      )}
      {status === 'error' && (
        <div>
          {output && <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-emerald-300">{output}</pre>}
          <div className="mt-1 flex items-start gap-1.5 font-mono text-[13px] leading-6 text-red-400">
            <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
            <pre className="whitespace-pre-wrap break-words">{error}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
