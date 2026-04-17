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
  "/tiendas": "Tiendas",
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
    <header className="cobrixs-topbar d-flex align-items-center justify-content-between flex-wrap gap-2">
      <h2 className="fs-6 fw-semibold text-dark mb-0">
        <i className="bi bi-grid-3x3-gap me-2 text-secondary" />
        {pageName}
      </h2>

      <div className="d-flex align-items-center gap-3 flex-wrap">
        {sessionOpen && (
          <span className="badge bg-success bg-opacity-10 text-success px-3 py-2">
            <i className="bi bi-check-circle-fill me-1" />
            Caja abierta
          </span>
        )}

        <span className="text-secondary small d-none d-md-inline">
          CobriXS v2.0
        </span>
      </div>
    </header>
  );
}