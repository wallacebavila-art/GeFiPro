export function Card({ children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children }) {
  return <h3 className="card-title">{children}</h3>;
}
