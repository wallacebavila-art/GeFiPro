export function FormGroup({ label, children }) {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      {children}
    </div>
  );
}

export function FormRow({ children }) {
  return <div className="form-row">{children}</div>;
}

export function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  inputMode,
  id,
  className = '',
  style = {},
  onKeyDown,
  onBlur,
  disabled = false,
}) {
  return (
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      inputMode={inputMode}
      className={className}
      style={style}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      disabled={disabled}
    />
  );
}

export function Select({
  id,
  value,
  onChange,
  children,
  className = '',
  disabled = false,
  style = {},
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={className}
      disabled={disabled}
      style={style}
    >
      {children}
    </select>
  );
}

export function TextArea({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
    />
  );
}
