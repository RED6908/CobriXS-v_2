import { useEffect, useState } from "react";
import { getProducts } from "../services/products.service";
import { getSales } from "../services/sales.service";
import type { Product, Sale } from "../types/database";

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [salesData, productsData] = await Promise.all([
          getSales(5),
          getProducts(),
        ]);

        setSales(salesData);
        setProducts(productsData);
      } catch (err) {
        console.error(err);
        setError("No fue posible cargar el dashboard desde Supabase.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);
  const productsSold = sales.length;
  const lowStockProducts = products.filter((product) => product.stock <= 5);

  return (
    <>
      <div className="alert alert-success d-flex align-items-center mb-4">
        <i className="bi bi-display fs-4 me-3"></i>
        <div>
          <strong>Modo Escritorio:</strong>
          <div className="small">Datos sincronizados con Supabase.</div>
        </div>
      </div>

      {loading && <div className="alert alert-info">Cargando datos...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4 mb-4">
        {[
          ["Ventas recientes", `$${totalSales.toFixed(2)}`, "currency-dollar"],
          ["Transacciones", `${productsSold}`, "cart"],
          ["Productos en stock", `${products.length}`, "box"],
          ["Stock bajo", `${lowStockProducts.length}`, "exclamation-triangle"],
        ].map(([title, value, icon]) => (
          <div className="col-md-3" key={title}>
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex justify-content-between">
                <div>
                  <div className="text-muted small">{title}</div>
                  <h4 className="fw-bold">{value}</h4>
                </div>
                <i className={`bi bi-${icon} fs-2 text-primary`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-sm h-100">
            <div className="card-header fw-semibold">
              <i className="bi bi-cart me-2" />
              Ventas recientes
            </div>
            <ul className="list-group list-group-flush">
              {sales.map((sale) => (
                <li className="list-group-item d-flex justify-content-between" key={sale.id}>
                  {new Date(sale.created_at).toLocaleString("es-MX")}
                  <strong>${sale.total.toFixed(2)}</strong>
                </li>
              ))}
              {sales.length === 0 && (
                <li className="list-group-item text-muted">Sin ventas registradas</li>
              )}
            </ul>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-warning shadow-sm h-100">
            <div className="card-header fw-semibold text-warning">
              <i className="bi bi-exclamation-triangle me-2" />
              Stock bajo
            </div>
            <ul className="list-group list-group-flush">
              {lowStockProducts.map((product) => (
                <li className="list-group-item d-flex justify-content-between" key={product.id}>
                  {product.name}
                  <span className="badge bg-danger">{product.stock} restantes</span>
                </li>
              ))}
              {lowStockProducts.length === 0 && (
                <li className="list-group-item text-muted">No hay alertas de stock</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
