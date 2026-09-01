export default function ProgressBar({ percent = 0, size = 'md', showLabel = false }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };

  return (
    <div className="w-full">
      <div className={`w-full overflow-hidden rounded-full bg-ink-100 ${heights[size] || heights.md}`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && <p className="mt-1 text-xs font-medium text-ink-500">{clamped}% complete</p>}
    </div>
  );
}
