const TAG_VARIANTS = {
  active: 't-active',
  paused: 't-paused',
  warn: 't-warn',
  parc: 't-parc',
  recorr: 't-recorr',
};

export default function Tag({
  children,
  variant,
  color,
  className = '',
  style = {},
}) {
  const classes = [
    'tag',
    variant && TAG_VARIANTS[variant],
    className,
  ].filter(Boolean).join(' ');

  const customStyle = color ? {
    background: `${color}22`,
    color: color,
    ...style,
  } : style;

  return (
    <span className={classes} style={customStyle}>
      {children}
    </span>
  );
}
