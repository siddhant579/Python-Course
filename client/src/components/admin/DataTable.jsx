// Generic admin list table - renders configurable columns and a row of
// action buttons (edit/publish/delete/etc.), so every content-management
// page (Weeks/Topics/Lessons/Exercises/Quizzes/Questions) shares one
// implementation instead of duplicating table markup.
export default function DataTable({ columns, rows, rowKey = '_id', actions, emptyMessage = 'Nothing here yet.' }) {
  if (!rows || rows.length === 0) {
    return <div className="rounded-xl border border-dashed border-ink-200 py-12 text-center text-sm text-ink-400">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-100">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-ink-50 text-xs font-semibold uppercase tracking-wide text-ink-500">
          <tr>
            {columns.map((c) => <th key={c.key} className="px-4 py-3">{c.label}</th>)}
            {actions && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100 bg-white">
          {rows.map((row) => (
            <tr key={row[rowKey]} className="hover:bg-ink-50/60">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 align-middle text-ink-700">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
              {actions && <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1.5">{actions(row)}</div></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
