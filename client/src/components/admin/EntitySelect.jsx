// Simple labeled <select> used across admin pages to pick a parent entity
// (course -> week -> topic -> lesson / quiz) before managing its children.
export default function EntitySelect({ label, value, onChange, options, placeholder = 'Select...', disabled }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <select
        className="input"
        value={value || ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
