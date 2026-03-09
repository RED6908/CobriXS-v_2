import { useProducts } from "../hooks/useProducts";

export default function Dashboard() {
  const { products } = useProducts();

  // Total stock
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);

  // Productos con stock bajo (<10)
  const lowStock = products.filter((p) => p.stock < 10);

  return (
    <>
      {/* Alert */}
      <div className="alert alert-success d-flex align-items-center mb-4">
        <i className="bi bi-display fs-4 me-3"></i>
        <div>
          <strong>Modo Escritorio:</strong>
          <div className="small">
            Acceso completo a todos los módulos, incluyendo el Panel de Cobro.
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="row g-4 mb-4">
        {[
          ["Productos en sistema", products.length, "box"],
          ["Stock total", totalStock, "archive"],
          ["Productos con stock bajo", lowStock.length, "exclamation-triangle"],
          ["Usuarios activos", 1, "people"], // puedes conectar luego a users
        ].map(([title, value, icon]) => (
          <div className="col-md-3" key={title as string}>
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

      {/* Lists */}
      <div className="row g-4">
        {/* Ventas recientes (puedes conectar después a tabla sales) */}
        <div className="col-lg-7">
          <div className="card shadow-sm h-100">
            <div className="card-header fw-semibold">
              <i className="bi bi-cart me-2" />
              Ventas recientes
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item text-muted">
                Próximamente conectado a ventas reales
              </li>
            </ul>
          </div>
        </div>

        {/* Stock bajo dinámico */}
        <div className="col-lg-5">
          <div className="card border-warning shadow-sm h-100">
            <div className="card-header fw-semibold text-warning">
              <i className="bi bi-exclamation-triangle me-2" />
              Stock bajo
            </div>

            <ul className="list-group list-group-flush">
              {lowStock.length === 0 ? (
                <li className="list-group-item text-muted">
                  Todo en orden 👍
                </li>
              ) : (
                lowStock.map((product) => (
                  <li
                    key={product.id}
                    className="list-group-item d-flex justify-content-between"
                  >
                    {product.name}
                    <span className="badge bg-danger">
                      {product.stock} restantes
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}