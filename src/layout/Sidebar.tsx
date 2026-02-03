import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link d-flex align-items-center gap-2 ${
      isActive ? "active" : "text-dark"
    }`;

  return (
    <aside
      className="bg-white border-end d-flex flex-column p-3"
      style={{ width: 270 }}
    >
      {/* Logo */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <div
          className="rounded-circle bg-primary"
          style={{ width: 36, height: 36 }}
        />
        <div>
          <strong>CobrixS</strong>
          <div className="text-muted small">Sistema POS Profesional</div>
        </div>
      </div>

      {/* Menu */}
      <ul className="nav nav-pills flex-column gap-2 mb-auto">
        <li className="nav-item">
          <NavLink to="/" end className={linkClass}>
            <i className="bi bi-house" /> Inicio
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/usuarios" className={linkClass}>
            <i className="bi bi-people" /> Usuarios
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/productos" className={linkClass}>
            <i className="bi bi-box" /> Productos
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/inventario" className={linkClass}>
            <i className="bi bi-archive" /> Inventario
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/pos" className={linkClass}>
            <i className="bi bi-cart" /> Panel de Cobro
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/provedores" className={linkClass}>
            <i className="bi bi-bar-chart" /> Provedores
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/reportes" className={linkClass}>
            <i className="bi bi-bar-chart" /> Reportes
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/configuracion" className={linkClass}>
            <i className="bi bi-gear" /> Configuración
          </NavLink>
        </li>
      </ul>

      {/* Footer */}
      <div className="border-top pt-3">
        <div className="small fw-semibold">Administrador</div>
        <div className="text-muted small">Admin</div>

        <button className="btn btn-outline-danger btn-sm w-100 mt-3">
          <i className="bi bi-box-arrow-right me-1" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
