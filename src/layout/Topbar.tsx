import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getActiveSession } from "../services/cashSession.service";

const routeNames: Record<string, string> = {
  "/": "Inicio",
  "/usuarios": "Usuarios",
  "/productos": "Productos",
  "/inventario": "Inventario",
  "/pos": "Panel de Cobro",
  "/provedores": "Proveedores",
  "/reportes": "Reportes",
  "/configuracion": "Configuración",
};

export default function Topbar() {
  const location = useLocation();
  const [sessionOpen, setSessionOpen] = useState(false);

  const pageName = routeNames[location.pathname] ?? "CobriXS";

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getActiveSession();
        setSessionOpen(!!session);
      } catch {
        setSessionOpen(false);
      }
    };

    checkSession();
  }, [location.pathname]);

  return (
    <nav className="bg-white border-bottom px-4 py-2 d-flex align-items-center justify-content-between">
      <span className="fw-semibold">
        <i className="bi bi-grid me-2 text-muted" />
        {pageName}
      </span>

      <div className="d-flex align-items-center gap-3">
        {sessionOpen && (
          <span className="badge bg-success-subtle text-success">
            <i className="bi bi-check-circle me-1" />
            Caja abierta
          </span>
        )}

        <span className="text-muted small d-none d-md-inline">
          <i className="bi bi-display me-1" />
          CobriXS POS
        </span>
      </div>
    </nav>
  );
}