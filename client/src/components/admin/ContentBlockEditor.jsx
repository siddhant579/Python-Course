import { Plus, Trash2, GripVertical } from 'lucide-react';

const BLOCK_TYPES = ['text', 'code', 'note', 'image'];

export default function ContentBlockEditor({ blocks, onChange }) {
  const update = (i, patch) => onChange(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  const remove = (i) => onChange(blocks.filter((_, idx) => idx !== i));
  const add = () => onChange([...blocks, { type: 'text', text: '' }]);
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <div key={i} className="rounded-lg border border-ink-200 p-3">
          <div className="mb-2 flex items-center gap-2">
            <GripVertical size={14} className="text-ink-300" />
            <select
              className="input w-32 py-1.5 text-xs"
              value={block.type}
              onChange={(e) => update(i, { type: e.target.value })}
            >
              {BLOCK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="ml-auto flex gap-1">
              <button type="button" className="rounded p-1 text-ink-400 hover:bg-ink-100" onClick={() => move(i, -1)}>↑</button>
              <button type="button" className="rounded p-1 text-ink-400 hover:bg-ink-100" onClick={() => move(i, 1)}>↓</button>
              <button type="button" className="rounded p-1 text-red-500 hover:bg-red-50" onClick={() => remove(i)}><Trash2 size={13} /></button>
            </div>
          </div>

          {block.type === 'code' ? (
            <>
              <input
                className="input mb-2 text-xs"
                placeholder="Language (default: python)"
                value={block.language || ''}
                onChange={(e) => update(i, { language: e.target.value })}
              />
              <textarea
                rows={5}
                className="input font-mono text-xs"
                placeholder="Python code..."
                value={block.code || ''}
                onChange={(e) => update(i, { code: e.target.value })}
              />
              <input
                className="input mt-2 text-xs"
                placeholder="Caption (optional)"
                value={block.caption || ''}
                onChange={(e) => update(i, { caption: e.target.value })}
              />
            </>
          ) : block.type === 'image' ? (
            <input
              className="input text-xs"
              placeholder="Image URL"
              value={block.imageUrl || ''}
              onChange={(e) => update(i, { imageUrl: e.target.value })}
            />
          ) : (
            <textarea
              rows={3}
              className="input text-sm"
              placeholder={block.type === 'note' ? 'Note text...' : 'Paragraph text...'}
              value={block.text || ''}
              onChange={(e) => update(i, { text: e.target.value })}
            />
          )}
        </div>
      ))}
      <button type="button" className="btn-ghost text-sm" onClick={add}><Plus size={14} /> Add content block</button>
    </div>
  );
}
