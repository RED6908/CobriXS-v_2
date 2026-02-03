export default function Topbar() {
  return (
    <nav className="bg-white border-bottom px-4 py-3">
      <span className="fw-semibold">
        <i className="bi bi-house-door me-2" />
        Inicio
      </span>
      <span className="text-muted ms-2">
        <i className="bi bi-display me-1" />
        Escritorio
      </span>
    </nav>
  );
}
