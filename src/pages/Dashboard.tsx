import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { getTodaySalesTotal, getSales } from "../services/sales.service";
import { getUsers } from "../services/users.service";
import PageHeader from "../components/PageHeader";

export default function Dashboard() {
  const { products } = useProducts();
  const [todaySales, setTodaySales] = useState(0);
  const [recentSales, setRecentSales] = useState<Array<{ id: string; total: number; created_at: string; payment_method?: string }>>([]);
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const from = today.toISOString();
    const to = new Date().toISOString();

    getTodaySalesTotal().then(setTodaySales).catch(() => setTodaySales(0));
    getSales(from, to).then((s) => setRecentSales(s.slice(0, 10))).catch(() => setRecentSales([]));
    getUsers().then((u) => setUsersCount(u.length)).catch(() => setUsersCount(0));
  }, []);

  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStock = products.filter((p) => p.stock < 10);

  const stats = [
    { title: "Productos", value: products.length, icon: "bi-box", color: "primary" },
    { title: "Stock total", value: totalStock, icon: "bi-archive", color: "primary" },
    { title: "Stock bajo", value: lowStock.length, icon: "bi-exclamation-triangle", color: lowStock.length > 0 ? "warning" : "success" },
    { title: "Ventas hoy", value: `$${todaySales.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`, icon: "bi-currency-dollar", color: "success" },
    { title: "Usuarios", value: usersCount, icon: "bi-people", color: "primary" },
  ];

  return (
    <div className="container-fluid">
      <PageHeader
        title="Resumen"
        subtitle="Vista general de tu negocio"
        breadcrumb={[{ label: "Inicio", to: "/" }]}
      />

      <div className="row g-4 mb-4">
        {stats.map((s) => (
          <div key={s.title} className="col-12 col-sm-6 col-xl">
            <div className="stat-card h-100">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-secondary small mb-1">{s.title}</div>
                  <h4 className="fw-bold mb-0">{s.value}</h4>
                </div>
                <div className={`stat-icon ${s.color}`}>
                  <i className={`bi ${s.icon}`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="cobrixs-card h-100">
            <div className="cobrixs-card-header d-flex justify-content-between align-items-center">
              <span><i className="bi bi-cart me-2" />Ventas recientes</span>
              <Link to="/pos" className="btn btn-sm btn-outline-primary">
                Ir al POS
              </Link>
            </div>
            <div className="cobrixs-card-body">
              {recentSales.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {recentSales.map((sale) => (
                    <li
                      key={sale.id}
                      className="list-group-item d-flex justify-content-between align-items-center px-0"
                    >
                      <div>
                        <span className="text-muted small">
                          {new Date(sale.created_at).toLocaleTimeString("es-MX", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {sale.payment_method && (
                          <span className="badge bg-light text-dark ms-2 text-capitalize">
                            {sale.payment_method}
                          </span>
                        )}
                      </div>
                      <strong>${(sale.total ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-receipt display-4 opacity-50" />
                  <p className="mt-2 mb-0">No hay ventas hoy</p>
                  <p className="small">Total hoy: <strong>${todaySales.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</strong></p>
                </div>
              )}
              {recentSales.length > 0 && (
                <p className="text-muted small mb-0 mt-2">
                  Total hoy: <strong>${todaySales.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</strong>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="cobrixs-card h-100 border-warning">
            <div className="cobrixs-card-header text-warning">
              <i className="bi bi-exclamation-triangle me-2" />
              Stock bajo
            </div>
            <ul className="list-group list-group-flush">
              {lowStock.length === 0 ? (
                <li className="list-group-item text-success">
                  <i className="bi bi-check-circle me-2" />
                  Todo en orden
                </li>
              ) : (
                lowStock.slice(0, 5).map((p) => (
                  <li
                    key={p.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <Link to="/inventario" className="text-decoration-none text-dark">
                      {p.name}
                    </Link>
                    <span className="badge bg-warning text-dark">{p.stock}</span>
                  </li>
                ))
              )}
              {lowStock.length > 5 && (
                <li className="list-group-item">
                  <Link to="/inventario" className="small">
                    Ver los {lowStock.length} productos con stock bajo →
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
