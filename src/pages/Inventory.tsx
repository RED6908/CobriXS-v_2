import { useMemo } from "react";
import { useProducts } from "../hooks/useProducts";

export default function Inventory() {
  const { products, loading, error } = useProducts();

  const inventoryValue = useMemo(
    () => products.reduce((acc, product) => acc + (product.purchase_price ?? 0) * product.stock, 0),
    [products],
  );
  const lowStockCount = products.filter((product) => product.stock <= 5).length;

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Gestión de Inventario</h3>
        <p className="text-muted">Control completo desde Supabase</p>
      </div>

      {loading && <div className="alert alert-info">Cargando inventario...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <StatCard label="Productos Totales" value={`${products.length}`} icon="bi-box" />
        <StatCard label="Alertas de Stock" value={`${lowStockCount}`} icon="bi-exclamation-triangle" />
        <StatCard label="Valor Total" value={`$${inventoryValue.toFixed(2)}`} icon="bi-graph-up" />
        <StatCard label="Categorías" value={`${new Set(products.map((p) => p.category ?? "Sin categoría")).size}`} icon="bi-tags" />
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Última actualización</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.code ?? "-"}</td>
                  <td>{product.category ?? "Sin categoría"}</td>
                  <td>{product.stock}</td>
                  <td>{new Date(product.created_at).toLocaleDateString("es-MX")}</td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    No hay inventario registrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="col-12 col-md-6 col-xl-3">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between">
            <span className="text-muted">{label}</span>
            <i className={`bi ${icon} text-primary`} />
          </div>
          <h3 className="fw-bold mt-2">{value}</h3>
        </div>
      </div>
    </div>
  );
}
