import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { useSettings } from "../context/SettingsContext";

export default function Sidebar() {
  const { profile } = useAuth();
  const { t } = useSettings();

  const isAdmin = profile?.role === "admin";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link d-flex align-items-center gap-2 ${
      isActive ? "active" : "text-dark"
    }`;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside
      className="bg-white border-end d-flex flex-column p-3"
      style={{ width: 270, minWidth: 220 }}
    >
      {/* Logo */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <div
          className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
          style={{ width: 36, height: 36 }}
        >
          <i className="bi bi-shop text-white" />
        </div>
        <div>
          <strong>CobriXS</strong>
          <div className="text-muted small">
            Sistema POS Profesional
          </div>
        </div>
      </div>

      {/* Menu */}
      <ul className="nav nav-pills flex-column gap-2 mb-auto">
        <li className="nav-item">
          <NavLink to="/" end className={linkClass}>
            <i className="bi bi-house" /> {t.dashboard}
          </NavLink>
        </li>

        {isAdmin && (
          <li className="nav-item">
            <NavLink to="/usuarios" className={linkClass}>
              <i className="bi bi-people" /> {t.users}
            </NavLink>
          </li>
        )}

        <li className="nav-item">
          <NavLink to="/productos" className={linkClass}>
            <i className="bi bi-box" /> {t.products}
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/inventario" className={linkClass}>
            <i className="bi bi-archive" /> {t.inventory}
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/pos" className={linkClass}>
            <i className="bi bi-cart" /> {t.pos}
          </NavLink>
        </li>

        {isAdmin && (
          <li className="nav-item">
            <NavLink to="/provedores" className={linkClass}>
              <i className="bi bi-buildings" /> {t.suppliers}
            </NavLink>
          </li>
        )}

        <li className="nav-item">
          <NavLink to="/reportes" className={linkClass}>
            <i className="bi bi-bar-chart" /> {t.reports}
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/configuracion" className={linkClass}>
            <i className="bi bi-gear" /> {t.settings}
          </NavLink>
        </li>
      </ul>

      {/* Footer */}
      <div className="border-top pt-3">
        <div className="small fw-semibold">
          {profile?.name || "Usuario"}
        </div>
        <div className="text-muted small">
          {profile?.role === "admin"
            ? "Administrador"
            : "Vendedor"}
        </div>

        <button
          className="btn btn-outline-danger btn-sm w-100 mt-3"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-1" />
          {t.logout}
        </button>
      </div>
    </aside>
  );
}