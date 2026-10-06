export default function FormInput({ label, name, value, onChange, error, type = 'text', multiline, hint, children }) {
  const props = { id: name, name, value, onChange, className: error ? 'invalid' : '' };
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children ||
        (multiline ? <textarea rows="3" {...props} /> : <input type={type} {...props} />)}
      {hint && !error && <small className="hint">{hint}</small>}
      {error && <small className="error-text">{error}</small>}
    </div>
  );
}
