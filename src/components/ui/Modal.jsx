export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeStyles = {
    sm: '360px',
    md: '480px',
    lg: '560px',
  };

  return (
    <div
      className={`modal-ov ${isOpen ? 'open' : ''}`}
      onClick={handleOverlayClick}
    >
      <div
        className="modal-box"
        style={{ maxWidth: sizeStyles[size] }}
      >
        <div className="modal-handle"></div>
        <div className="modal-hdr">
          <span>{title}</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
