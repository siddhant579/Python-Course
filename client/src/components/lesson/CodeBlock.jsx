import { useState } from 'react';
import { Copy, Check, Terminal, Play, Loader2 } from 'lucide-react';
import { highlightLine } from '../../utils/highlightCode';
import { runPython } from '../../utils/pyodideRunner';
import PythonOutput from './PythonOutput.jsx';

export default function CodeBlock({ code = '', language = 'python', caption, showLineNumbers = true, runnable }) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const lines = code.replace(/\n$/, '').split('\n');
  const canRun = runnable ?? language?.toLowerCase() === 'python';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable - silently ignore
    }
  };

  const handleRun = async () => {
    setStatus('loading');
    const result = await runPython(code);
    setOutput(result.output);
    setError(result.error);
    setStatus(result.error ? 'error' : 'done');
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-ink-800 bg-ink-950 shadow-card">
      <div className="flex items-center justify-between border-b border-ink-800/80 bg-ink-900 px-4 py-2">
        <div className="flex items-center gap-2 text-xs font-medium text-ink-400">
          <Terminal size={13} />
          <span className="uppercase tracking-wide">{language}</span>
          {caption && <span className="text-ink-500">· {caption}</span>}
        </div>
        <div className="flex items-center gap-1">
          {canRun && (
            <button
              onClick={handleRun}
              disabled={status === 'loading'}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-emerald-400 hover:bg-ink-800 disabled:opacity-60 transition-colors"
            >
              {status === 'loading' ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
              Run
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink-400 hover:bg-ink-800 hover:text-white transition-colors"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <pre className="min-w-full px-4 py-3 font-mono text-[13px] leading-6">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="flex">
                {showLineNumbers && (
                  <span className="mr-4 w-6 flex-shrink-0 select-none text-right text-ink-600">{i + 1}</span>
                )}
                <span className="whitespace-pre text-ink-100">
                  {highlightLine(line).map((tok, j) => (
                    <span key={j} className={tok.className}>{tok.text}</span>
                  ))}
                  {line.length === 0 && ' '}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
      <PythonOutput status={status} output={output} error={error} />
    </div>
  );
}
