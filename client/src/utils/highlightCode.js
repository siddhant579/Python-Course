// Lightweight, dependency-free syntax highlighter. Good enough for Python
// (and JS/SQL) code blocks without pulling in a heavy highlighting library.
// Returns an array of { text, className } tokens per line.

const PY_KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class',
  'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global',
  'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return',
  'try', 'while', 'with', 'yield', 'self',
]);

const PY_BUILTINS = new Set([
  'print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple', 'bool',
  'input', 'type', 'sorted', 'enumerate', 'zip', 'map', 'filter', 'open', 'super', 'isinstance',
]);

const TOKEN_RE = /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+\.?\d*\b)|(\b[A-Za-z_]\w*\b)|([()[\]{}:,.=+\-*/%<>!&|^~]+)/gm;

export function highlightLine(line) {
  const tokens = [];
  let lastIndex = 0;
  let match;
  TOKEN_RE.lastIndex = 0;

  while ((match = TOKEN_RE.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: line.slice(lastIndex, match.index), className: '' });
    }
    const [full, comment, string, number, word, punct] = match;
    if (comment) tokens.push({ text: comment, className: 'text-ink-400 italic' });
    else if (string) tokens.push({ text: string, className: 'text-emerald-400' });
    else if (number) tokens.push({ text: number, className: 'text-accent-300' });
    else if (word) {
      if (PY_KEYWORDS.has(word)) tokens.push({ text: word, className: 'text-brand-300 font-medium' });
      else if (PY_BUILTINS.has(word)) tokens.push({ text: word, className: 'text-amber-300' });
      else tokens.push({ text: word, className: '' });
    } else if (punct) tokens.push({ text: punct, className: 'text-ink-300' });
    lastIndex = TOKEN_RE.lastIndex;
  }
  if (lastIndex < line.length) tokens.push({ text: line.slice(lastIndex), className: '' });
  return tokens;
}
