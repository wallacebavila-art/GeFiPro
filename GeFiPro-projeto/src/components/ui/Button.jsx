const BUTTON_VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

const BUTTON_SIZES = {
  sm: 'btn-sm',
  xs: 'btn-xs',
};

export default function Button({
  children,
  variant = 'primary',
  size,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  style = {},
  title,
}) {
  const classes = [
    'btn',
    BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary,
    size && BUTTON_SIZES[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      style={style}
      title={title}
    >
      {children}
    </button>
  );
}
