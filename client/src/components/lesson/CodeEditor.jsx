import { useState } from 'react';
import { Terminal, Play, Loader2, RotateCcw } from 'lucide-react';
import { runPython } from '../../utils/pyodideRunner';
import PythonOutput from './PythonOutput.jsx';

// An editable Python code box (unlike CodeBlock, which is read-only) - used
// on exercises so a student can actually try their own solution and run it,
// entirely client-side via Pyodide.
export default function CodeEditor({ starterCode = '', caption = 'your code' }) {
  const [code, setCode] = useState(starterCode);
  const [status, setStatus] = useState('idle');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleRun = async () => {
    setStatus('loading');
    const result = await runPython(code);
    setOutput(result.output);
    setError(result.error);
    setStatus(result.error ? 'error' : 'done');
  };

  const handleReset = () => {
    setCode(starterCode);
    setStatus('idle');
    setOutput('');
    setError('');
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-ink-800 bg-ink-950 shadow-card">
      <div className="flex items-center justify-between border-b border-ink-800/80 bg-ink-900 px-4 py-2">
        <div className="flex items-center gap-2 text-xs font-medium text-ink-400">
          <Terminal size={13} />
          <span className="uppercase tracking-wide">Python</span>
          <span className="text-ink-500">· {caption}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink-400 hover:bg-ink-800 hover:text-white transition-colors"
          >
            <RotateCcw size={13} /> Reset
          </button>
          <button
            onClick={handleRun}
            disabled={status === 'loading'}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-ink-800 disabled:opacity-60 transition-colors"
          >
            {status === 'loading' ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
            Run Code
          </button>
        </div>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={Math.min(Math.max(code.split('\n').length, 4), 16)}
        className="w-full resize-y bg-transparent px-4 py-3 font-mono text-[13px] leading-6 text-ink-100 outline-none"
      />

      <PythonOutput status={status} output={output} error={error} />
    </div>
  );
}
