export default function Badge({ children, color, bg, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ color: color || '#333', backgroundColor: bg || '#f0f0f0' }}
    >
      {children}
    </span>
  );
}
