import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { useSettings } from "../context/SettingsContext";

export default function Sidebar() {

  const { profile } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();

  const isAdmin = profile?.role === "admin";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link d-flex align-items-center gap-2 ${isActive ? "active" : ""}`;

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error al cerrar sesión:", error.message);
        return;
      }

      navigate("/login");
    } catch (err) {
      console.error("Error inesperado:", err);
    }
  };

  return (
    <aside className="cobrixs-sidebar">
      <div className="sidebar-brand">
        <div className="d-flex align-items-center gap-3">
          <div className="sidebar-brand-icon">
            <i className="bi bi-shop" />
          </div>
          <div>
            <strong className="text-dark d-block">CobriXS</strong>
            <small className="text-muted">Sistema POS</small>
          </div>
        </div>
      </div>

      <ul className="nav flex-column gap-1 p-3 flex-grow-1">

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

        <li className="nav-item">
          <NavLink to="/provedores" className={linkClass}>
            <i className="bi bi-buildings" /> {t.suppliers}
          </NavLink>
        </li>

        {isAdmin && (
          <li className="nav-item">
            <NavLink to="/reportes" className={linkClass}>
              <i className="bi bi-bar-chart" /> {t.reports}
            </NavLink>
          </li>
        )}

        <li className="nav-item">
          <NavLink to="/configuracion" className={linkClass}>
            <i className="bi bi-gear" /> {t.settings}
          </NavLink>
        </li>

      </ul>

      <div className="sidebar-footer">
        <div className="text-dark small fw-semibold">
          {profile?.name || "Usuario"}
        </div>
        <div className="text-muted small">
          {profile?.role === "admin" ? "Administrador" : "Vendedor"}
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm w-100 mt-2"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
        >
          <i className="bi bi-box-arrow-right me-1" />
          {t.logout}
        </button>
      </div>
    </aside>
  );
}