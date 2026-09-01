const VARIANTS = {
  neutral: 'bg-ink-100 text-ink-600',
  brand: 'bg-brand-50 text-brand-600',
  accent: 'bg-accent-100 text-accent-800',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-600',
};

export default function Badge({ children, variant = 'neutral', icon: Icon, className = '' }) {
  return (
    <span className={`badge ${VARIANTS[variant] || VARIANTS.neutral} ${className}`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    'not-started': { label: 'Not Started', variant: 'neutral' },
    'in-progress': { label: 'In Progress', variant: 'brand' },
    completed: { label: 'Completed', variant: 'success' },
    published: { label: 'Published', variant: 'success' },
    draft: { label: 'Draft', variant: 'warning' },
    uploaded: { label: 'Uploaded', variant: 'neutral' },
    processing: { label: 'Processing', variant: 'brand' },
    reviewed: { label: 'Reviewed', variant: 'accent' },
    failed: { label: 'Failed', variant: 'danger' },
  };
  const cfg = map[status] || { label: status, variant: 'neutral' };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
