// Runs Python entirely inside the browser via Pyodide (CPython compiled to
// WebAssembly). This is deliberately NOT server-side execution - per the
// platform's security rules, arbitrary user code must never run on the
// Node.js server. Pyodide is loaded lazily (only when a student first hits
// "Run"), cached as a singleton, and reused for every subsequent run.

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodideReadyPromise = null;

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-pyodide-loader="true"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.pyodideLoader = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load the Python runtime. Check your connection and try again.'));
    document.body.appendChild(script);
  });
}

function getPyodide() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = loadScriptOnce(`${PYODIDE_CDN}pyodide.js`)
      .then(() => window.loadPyodide({ indexURL: PYODIDE_CDN }))
      .catch((err) => {
        pyodideReadyPromise = null; // allow retrying after a failed load
        throw err;
      });
  }
  return pyodideReadyPromise;
}

// Pre-warms the runtime (call on hover/mount if you want zero-latency on
// the first real Run click). Safe to call multiple times.
export function preloadPython() {
  getPyodide().catch(() => {});
}

// Runs `code` and returns { output, error }. stdout/stderr are captured and
// combined in order; a Python exception is returned as `error` (its message)
// with whatever printed before the crash still in `output`.
export async function runPython(code) {
  const pyodide = await getPyodide();

  let output = '';
  pyodide.setStdout({ batched: (msg) => { output += msg + '\n'; } });
  pyodide.setStderr({ batched: (msg) => { output += msg + '\n'; } });

  try {
    await pyodide.runPythonAsync(code);
    return { output: output.trimEnd(), error: null };
  } catch (err) {
    // Trim Pyodide's internal traceback framing down to the Python-relevant part
    const message = String(err.message || err).split('\n').filter(Boolean).slice(-3).join('\n');
    return { output: output.trimEnd(), error: message };
  } finally {
    pyodide.setStdout({});
    pyodide.setStderr({});
  }
}
