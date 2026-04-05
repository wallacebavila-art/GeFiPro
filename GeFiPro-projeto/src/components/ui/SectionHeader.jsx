export default function SectionHeader({ title, highlight, children }) {
  return (
    <div className="section-hdr">
      <h2>
        {title} <span>{highlight}</span>
      </h2>
      {children}
    </div>
  );
}
