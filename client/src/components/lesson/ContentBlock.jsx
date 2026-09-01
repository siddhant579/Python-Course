import CodeBlock from './CodeBlock.jsx';
import { Info } from 'lucide-react';

export default function ContentBlock({ block }) {
  switch (block.type) {
    case 'code':
      return <CodeBlock code={block.code} language={block.language || 'python'} caption={block.caption} />;
    case 'image':
      return (
        <figure className="my-4">
          <img src={block.imageUrl} alt={block.caption || ''} className="rounded-xl border border-ink-100" />
          {block.caption && <figcaption className="mt-2 text-center text-xs text-ink-400">{block.caption}</figcaption>}
        </figure>
      );
    case 'note':
      return (
        <div className="my-4 flex gap-3 rounded-xl border border-accent-200 bg-accent-50 p-4">
          <Info size={18} className="mt-0.5 flex-shrink-0 text-accent-700" />
          <p className="text-sm text-accent-900">{block.text}</p>
        </div>
      );
    case 'text':
    default:
      return <p className="my-3 whitespace-pre-wrap leading-7 text-ink-700">{block.text}</p>;
  }
}
